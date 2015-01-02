"use strict"

##################
# MyWallet hacks #
##################

# Avoid lazy loading (complicates asset management)
loadScript = (src, success, error) ->
  success()
  
# Don't allow it to play sound:
playSound = (id) ->
  return

##################################
# Wallet service                 #
#                                #
# AngularJS wrapper for MyWallet #
##################################

walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet, $rootScope, ngAudio, $cookieStore, $translate, $filter, $state, $q) -> 
  wallet = {status: {isLoggedIn: false}, settings: {currency: null, language: null, needs2FA: null, twoFactorMethod: null, feePolicy: null, handleBitcoinLinks: false, blockTOR: null, rememberTwoFactor: null, secondPassword: null}, user: {email: null, mobile: null, passwordHint: "", pairingCode: ""}}
  
  wallet.fiatHistoricalConversionCache = {}
  
  wallet.conversions = {}
  
  wallet.accounts     = []
  wallet.legacyAddresses = []
  wallet.addressBook  = {}
  wallet.paymentRequests = []
  wallet.alerts = []
  wallet.my = MyWallet
  wallet.transactions = []
  wallet.languages = []
  wallet.currencies = []
    
  ##################################
  #             Public             #
  ##################################
  
  wallet.didLogin = () ->    
    wallet.status.isLoggedIn = true 
    
    wallet.my.makePairingCode((result)->
      wallet.user.pairingCode = result
    )
    
    for address, label of wallet.my.getAddressBook()
      wallet.addressBook[address] = label
      
    unless wallet.my.getHDWallet() == null
      wallet.updateAccounts()
      
    wallet.settings.secondPassword = wallet.my.getDoubleEncryption()
            
    # Get email address, etc
    # console.log "Getting info..."
    wallet.my.get_account_info((result)->
      wallet.user.email = result.email
      if result.sms_number
         wallet.user.mobile = {country: result.sms_number.split(" ")[0], number: result.sms_number.split(" ")[1]}
      else # Field is not present if not entered
        wallet.user.mobile = {country: "+1", number: ""}          
        
      wallet.user.isEmailVerified = result.email_verified 
      wallet.user.isMobileVerified = result.sms_verified
      wallet.user.passwordHint = result.password_hint1 # Field not present if not entered
      
      wallet.setLanguage($filter("getByProperty")("code", result.language, wallet.languages))
      
      # Get currencies:
      
      wallet.setCurrency($filter("getByProperty")("code", result.currency, wallet.currencies))
      
      wallet.settings.feePolicy = wallet.my.getFeePolicy()
      
      wallet.settings.blockTOR = !!result.block_tor_ips
      
      # Fetch transactions:
      unless wallet.my.getHDWallet() == null
        wallet.my.getHistoryAndParseMultiAddressJSON()
      
      wallet.applyIfNeeded()
    )
    
    wallet.applyIfNeeded()
    
 
    
  wallet.login = (uid, password, two_factor_code, observer) ->  
    needsTwoFactorCode = (method) ->
      wallet.displayWarning("Please enter your 2FA code")
      wallet.settings.needs2FA = true
      # 2: Email
      # 3: Yubikey (depricated)
      # 4: Google Authenticator
      # 5: SMS
      
      observer.needs2FA()
  
      wallet.settings.twoFactorMethod = method 
      $state.go("login")
      return
      
    wrongTwoFactorCode = (method) ->
      $state.go("login")
      return
  
    loginError = (error) ->
      console.log(error)
      wallet.displayError(error)
      
      if observer?
        observer.error()
      else
        $state.go("login")
      
      wallet.applyIfNeeded()
      
      return
  
    if two_factor_code? && two_factor_code != ""
      wallet.settings.needs2FA = true
    else
      two_factor_code = undefined
    
    authorizationProvided = () ->
      wallet.clearAlerts()
      wallet.displaySuccess("Login approved, checking password...")
      wallet.applyIfNeeded()
    
    authorizationRequired = (callback) ->
      callback(authorizationProvided)
      wallet.displayWarning("Please check your email to approve this login attempt.", true)
      wallet.applyIfNeeded()
      
    $window.root = "https://blockchain.info/"   
    wallet.my.fetchWalletJson(uid, null, null, password, two_factor_code, wallet.didLogin, needsTwoFactorCode, wrongTwoFactorCode, authorizationRequired, loginError ) 
    
    wallet.fetchExchangeRate()
  
    
  wallet.create = (password, email, currency, language, success_callback) ->      
    success = (uid) ->
      wallet.displaySuccess("Wallet created with identifier: " + uid, true)
      wallet.login(uid, password)
      success_callback(uid)
    
    error = (error) ->
      if error.message != undefined
        wallet.displayError(error.message)
      else
        wallet.displayError(error)
        
    currency_code = "USD"
    language_code = "en"
    
    if currency?
      currency_code = currency.code
      
    if language?
      language_code = language.code
      
    wallet.my.createNewWallet(email, password, language_code, currency_code, success, error)
        
  wallet.createAccount = (name) ->
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
      
    success = () ->
      wallet.updateAccounts()  
      wallet.transactions.push []
      wallet.my.getHistoryAndParseMultiAddressJSON()
      
    error = () ->
    
    wallet.my.createAccount(name, needsSecondPasswordCallback, success, error)
  
  wallet.renameAccount = (account, name) ->
    wallet.my.setLabelForAccount(account.index, name)
    wallet.updateAccountsAndLegacyAddresses()
    
  wallet.changeLegacyAddressLabel = (address, label) ->
    wallet.my.setLegacyAddressLabel(address.address, label)
    address.label = label
    
  wallet.logout = () ->
    wallet.didLogoutByChoice = true
    wallet.my.logout() # broadcast "logging_out"

  wallet.isCorrectMainPassword = (candidate) ->
    wallet.my.isCorrectMainPassword(candidate)
    
  wallet.changePassword = (newPassword) ->
    wallet.my.changePassword(newPassword, (()-> 
      $translate("CHANGE_PASSWORD_SUCCESS").then (translation) ->
        wallet.displaySuccess(translation)
    ),() ->
      $translate("CHANGE_PASSWORD_FAILED").then (translation) ->
        wallet.displayError(translation) 
    )
    
  
  ####################
  #   Transactions   #
  ####################
  
  wallet.recommendedTransactionFee = (origin, amount) ->
    # amount in Satoshi
    if origin.address?
      return wallet.my.recommendedTransactionFeeForAddress(origin.address, amount)
    else if origin.index?
      return wallet.my.recommendedTransactionFeeForAccount(origin.index, amount)
    else
      return null
    
  #############
  # Spend BTC #
  #############
  
  # Converts units of fiat to BTC (not Satoshi)
  wallet.fiatToSatoshi = (amount, currency) ->
    return null if currency == "BTC"
    return null unless amount?
    return null unless wallet.conversions[currency]?
    return parseInt(numeral(amount).multiply(wallet.conversions[currency].conversion).format("0"))

  # amount in BTC, returns formatted amount in fiat
  wallet.BTCtoFiat = (amount, currency) ->
    return null if currency == "BTC"
    return null unless amount?
    return null unless wallet.conversions[currency]?
    return numeral(100000000).multiply(amount).divide(wallet.conversions[currency].conversion).format("0.00")

  wallet.getFiatAtTime = (amount, time, currency) ->
    defer = $q.defer()
    # Cache the result since historical rates don't change within one session and we don't want to hammer the server
    key = amount + currency + time
    
    success = (fiat) ->
      console.log fiat
      wallet.fiatHistoricalConversionCache[key] = fiat
      defer.resolve(numeral(fiat).format("0.00"))
      
    error = (reason) ->
      defer.reject(reason)
    
    if wallet.fiatHistoricalConversionCache[key]
      success(wallet.fiatHistoricalConversionCache[key])
    else 
      # The currency argument in the API is case sensitive.
      # Time argument in milliseconds
      wallet.my.getFiatAtTime(time * 1000, amount, currency.toLowerCase(), success, error) 
    
    return defer.promise
  
  wallet.transactionObserver = (observer) ->    
    o = {}
    
    o.transactionSuccess = () ->
        wallet.updateTransactions()
        wallet.updateAccountsAndLegacyAddresses()
    
        observer.transactionDidFinish()
      
    o.transactionError = (e) ->
        if e.message != undefined
          observer.transactionDidFailWithError(e.message)
        else if e isnt null
          observer.transactionDidFailWithError(e)
          wallet.applyIfNeeded()
        else
          observer.transactionDidFailWithError("Unknown error")
          wallet.applyIfNeeded() 
          
    o.needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
          
    return o
        
  wallet.checkAndGetTransactionAmount = (amount, currency, observer) ->
    if currency != "BTC"
      amount = wallet.fiatToSatoshi(amount, currency)
    else 
      amount = parseInt(numeral(amount).multiply(100000000).format("0"))
    
    if observer == undefined || observer == null
      console.error "An observer is required"
      return
      
    if observer.transactionDidFailWithError == undefined
      console.error "Observer should implement transactionDidFailWithError"
      return
      
    if observer.transactionDidFinish == undefined
      console.error "Observer should implement transactionDidFinish"
      return
      
    return amount

  wallet.addAddressOrPrivateKey = (addressOrPrivateKey, successCallback, errorCallback) ->
    if addressOrPrivateKey == ""
      errorCallback({invalidInput: true})
      return
      
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback      
        
    if address = wallet.my.isValidPrivateKey(addressOrPrivateKey)
      privateKey = addressOrPrivateKey
      if wallet.my.legacyAddressExists(address)
        address = $filter("getByProperty")("address", address, wallet.legacyAddresses)
        if address.isWatchOnlyLegacyAddress
          success = (address) ->
            wallet.updateLegacyAddresses() # Probably too early
            successCallback({address: address})
            
          wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, success, null)
          return
        else
          errorCallback({addressPresentInWallet: true}, address)
          return
          
      else
        success = (address) ->
          addressItem = {address: address, isWatchOnlyLegacyAddress: false, active: true, legacy: true, balance: null}
          wallet.legacyAddresses.push addressItem
          wallet.updateLegacyAddresses() # Probably too early
          successCallback(addressItem)
          return
        
        wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, success, null)
      return
    
    if wallet.my.isValidAddress(addressOrPrivateKey)   
      address = addressOrPrivateKey  
      if wallet.my.legacyAddressExists(address)
        errorCallback({addressPresentInWallet: true}, {address: address})
        return
      else
        wallet.my.addWatchOnlyLegacyAddress(address)
        addressItem = {address: address, isWatchOnlyLegacyAddress: true, active: true, legacy: true, balance: null}
        wallet.legacyAddresses.push addressItem
        wallet.updateLegacyAddresses() # Probably too early
        successCallback(addressItem)
        return
        
    errorCallback({invalidInput: true})
    return
  
  # Amount in satoshi or fiat
  wallet.send         = (from, to,             amount, currency, observer) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, observer)
    
    if from.index?
      wallet.my.sendBitcoinsForAccount(from.index, to, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
    else if from.address?
      wallet.my.sendFromLegacyAddressToAddress(from.address, to, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
      
  wallet.sendInternal = (from, destination, amount, currency, observer) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, observer)
    
    if from.address?
      if destination.index?
        wallet.my.sendFromLegacyAddressToAccount(from.address, destination.index, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
      else if destination.address?
        wallet.my.sendFromLegacyAddressToAddress(from.address, destination.address, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
    else if from.index?
      if destination.index?
        wallet.my.sendToAccount(from.index, destination.index, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
      else if destination.address?
        wallet.my.sendBitcoinsForAccount(from.index, destination.address, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
      
      
  wallet.sweepLegacyToAccount = (fromAddress, toAccountIndex, observer) ->
    wallet.my.sweepLegacyToAccount(fromAddress.address, toAccountIndex, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback)
    wallet.updateLegacyAddresses() # Probably too early  
      
  wallet.sendToEmail = (fromAccountIndex, email, amount, currency, observer) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, observer)
    wallet.my.sendToEmail(fromAccountIndex, amount, 10000, email, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError, wallet.transactionObserver(observer).needsSecondPasswordCallback) 
      
  wallet.redeemFromEmailOrMobile = (account, claim, success, error) ->
    wallet.my.redeemFromEmailOrMobile(account.index, claim, success, error)
    
  wallet.fetchBalanceForRedeemCode = (code) ->
    defer = $q.defer();
    
    success = (balance) ->
      defer.resolve(balance)
    
    error = (error) ->
      console.log "Could not retrieve balance"
      console.log error
      defer.reject()
    
    wallet.my.getBalanceForRedeemCode(code, success, error)
    
    return defer.promise
    
  wallet.getMnemonic = (successCallback, errorCallback) ->
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
    
    success = (mnemonic) ->
      successCallback(mnemonic)
    
    error = () ->
      wallet.my.displayError("Unable to show mnemonic.")
      errorCallback()
  
    wallet.my.getHDWalletPassphraseString(needsSecondPasswordCallback, success, error)
    
  wallet.importWithMnemonic = (mnemonic, successCallback, errorCallback) ->
    wallet.accounts.splice(0, wallet.accounts.length)
    wallet.transactions.splice(0, wallet.transactions.length)
    
    success = () ->
      wallet.updateAccounts()
      wallet.updateTransactions()
      
      successCallback()
          
    $timeout((->
      wallet.my.recoverMyWalletHDWalletFromMnemonic(mnemonic, null, success, errorCallback)    
    ), 100)  
            
  wallet.getDefaultAccountIndex = () ->
    wallet.my.getDefaultAccountIndex()
    
  wallet.getReceivingAddressForAccount = (idx) ->
    wallet.my.getReceivingAddressForAccount(idx)
    
  ###################
  # URL: bitcoin:// #
  ###################
  
  wallet.parsePaymentRequest = (url) ->
    result = {address: null, amount: null, hasBitcoinPrefix: false, currency: null}
            
    if url.indexOf("bitcoin:") == 0
       result.hasBitcoinPrefix = true
       result.isValid = true # Optimistic...
      
       withoutPrefix = url.replace("bitcoin://","").replace("bitcoin:", "")
       if withoutPrefix.indexOf("?") != -1
         address = withoutPrefix.substr(0, withoutPrefix.indexOf("?"))
         result.address = address
         argumentList = withoutPrefix.replace(address + "?", "")
         loopCount = 0

         for i in [0..argumentList.match(/&/g | []).length]
           argument = argumentList.substr(0,argumentList.indexOf("="))
           isLastArgument = argumentList.indexOf("&") == -1

           value = undefined

           if !isLastArgument
             value = argumentList.substr(argument.length + 1, argumentList.indexOf("&") - argument.length - 1)
           else
             value = argumentList.substr(argument.length + 1, argumentList.length - argument.length - 1)

           if argument == "amount"
             result.amount = numeral(value).format("0.[00000000]")
             result.currency = "BTC"
           else
             $log.info "Ignoring argument " + argument + " in: " + url
             loopCount++

           argumentList = argumentList.replace(argument + "=" + value + "&", "")

       else
         result.address = withoutPrefix
    
    return result
  
  ###################
  #      Other      #
  ###################
  wallet.lastAlertId = 0
  
  wallet.closeAlert = (alert) ->
    $timeout.cancel(alert.timer)
    wallet.alerts.splice(wallet.alerts.indexOf(alert))    
  
  wallet.clearAlerts = () ->
    for alert in wallet.alerts
      wallet.alerts.pop(alert)
      if alert?
        $timeout.cancel(alert.timer)
 
  wallet.displayInfo = (message, keep=false) ->
    wallet.displayAlert {type: "info", msg: message}, keep
      
  wallet.displaySuccess = (message, keep=false) ->
    wallet.displayAlert {type: "success", msg: message}, keep
      
  wallet.displayWarning = (message, keep=false) ->
    wallet.displayAlert  {msg: message}, keep
    
  wallet.displayError = (message, keep=false) ->
    wallet.displayAlert {type: "danger", msg: message}, keep
      
  wallet.displayAlert = (alert, keep=false) ->
    if !keep
      wallet.lastAlertId++
      alert.timer = $timeout((->
        wallet.alerts.splice(wallet.alerts.indexOf(alert))
      ), 7000)
      
    wallet.alerts.push(alert)

    
  wallet.isSynchronizedWithServer = () ->
    return wallet.my.isSynchronizedWithServer()

  window.onbeforeunload = (event) -> 
    if !wallet.isSynchronizedWithServer()
      event.preventDefault()
      # This works in Chrome:
      return "There are unsaved changes. Are you sure?"
      
  wallet.isValidAddress = (address) ->
    return wallet.my.isValidAddress(address)
    
  wallet.archive = (address) ->
    wallet.my.archiveLegacyAddr(address.address)
    address.active = false
    
  wallet.unarchive = (address) ->
    wallet.my.unArchiveLegacyAddr(address.address)
    address.active = true
        
  wallet.deleteLegacyAddress = (address) ->
    wallet.my.deleteLegacyAddress(address.address)
    idx = wallet.legacyAddresses.indexOf(address)
    wallet.legacyAddresses.splice(idx,1)
    
        
  ##################################
  #        Private (other)         #
  ##################################
  
  wallet.updateAccountsAndLegacyAddresses = () ->
    unless wallet.my.getHDWallet() == null
      wallet.updateAccounts()
    wallet.updateLegacyAddresses()
    
  wallet.updateAccounts = () ->
    # Carefully update our array of accounts, so Angular watchers don't get confused.
    # Assuming accounts are never deleted.
    
    numberOfOldAccounts = wallet.accounts.length
    numberOfNewAccounts = wallet.my.getAccountsCount()
        
    defaultAccountIndex = wallet.my.getDefaultAccountIndex()
        
    if numberOfNewAccounts > 0
      for i in [0..(numberOfNewAccounts - 1)]
        if i >= numberOfOldAccounts
          wallet.accounts.push {active: true, legacy: false, index: i}
      
        # Set or update label and balance:
        wallet.accounts[i].label = wallet.my.getLabelForAccount(i)
        wallet.accounts[i].balance = wallet.my.getBalanceForAccount(i)
        wallet.accounts[i].isDefault = !(defaultAccountIndex < i or defaultAccountIndex > i) 
    
  wallet.updateLegacyAddresses = () ->
    numberOfOldAddresses = wallet.legacyAddresses.length
    numberOfNewAddresses = wallet.my.getAllLegacyAddresses().length
    
    if numberOfNewAddresses > 0
      for i in [0..(numberOfNewAddresses - 1)]
        addressItem = undefined
        if i >= numberOfOldAddresses
          address = wallet.my.getAllLegacyAddresses()[i]
          addressItem = {address: address, active: wallet.my.getLegacyActiveAddresses().indexOf(address) > -1, legacy: true} 
          wallet.legacyAddresses.push addressItem
        else
          addressItem = wallet.legacyAddresses[i]
      
        # Set or update label and balance:
        addressItem.label = wallet.my.getLegacyAddressLabel(addressItem.address) 
        unless addressItem.label?
          addressItem.label = addressItem.address
        addressItem.balance = wallet.my.getLegacyAddressBalance(addressItem.address)
        addressItem.isWatchOnlyLegacyAddress = wallet.my.isWatchOnlyLegacyAddress(addressItem.address)
      
    # Balances will be 0 until transactions have been loaded.
    # TODO: MyWallet should let us know when all transactions are loaded; hide
    # total until that time.
    
        
  wallet.total = (accountIndex) -> 
    return null if wallet.accounts == undefined
    if !(accountIndex?) || accountIndex == ""
      tally = 0
      for account in wallet.accounts
        return null if account.balance == undefined
        tally = tally += account.balance
            
      return tally
    else if accountIndex == "imported"
      return wallet.my.getTotalBalanceForActiveLegacyAddresses()
    else
      account = wallet.accounts[parseInt(accountIndex)]
      return null if account == undefined
      return account.balance
    
  wallet.updateTransactions = () ->
    for tx in wallet.my.getAllTransactions()
      match = false
      for candidate in wallet.transactions
        if candidate.hash == tx.hash
          match = true
          break
    
      if !match
        transaction = angular.copy(tx)
        transaction.note = wallet.my.getNote(transaction.hash)
        amount = 0
        if transaction.from.account? # Spend or intra-wallet
          if transaction.intraWallet
            amount += transaction.from.account.amount
          else
            amount -= transaction.from.account.amount
        else if transaction.to.account?
          amount += transaction.to.account.amount
        if transaction.from.legacyAddresses? && transaction.from.legacyAddresses.length > 0
          amount += transaction.from.legacyAddresses[0].amount
        if transaction.from.externalAddresses?
          amount += transaction.from.externalAddresses.amount
          
        transaction.amount = amount
          
        wallet.transactions.push transaction 
          
  ####################
  # Notification     #
  ####################
            
  # The old monitoring system
  wallet.monitorLegacy = (event, data) ->
    # console.logaccountsd: " + event
    if event == "on_tx" or event == "on_block"
      before = wallet.transactions.length
      wallet.updateTransactions()
      if wallet.transactions.length > before
        sound = ngAudio.load("beep.wav")
        sound.play()
        wallet.updateTransactions()
        wallet.updateAccountsAndLegacyAddresses()
    else if event == "error_restoring_wallet"
      wallet.applyIfNeeded()      
    else if event == "did_set_guid" # Wallet retrieved from server
    else if event == "on_wallet_decrypt_finish" # Non-HD part is decrypted
    else if event == "hd_wallets_does_not_exist"
      # Create a new one:
      console.log "Creating new HD wallet..."
      needsSecondPasswordCallback = (continueCallback) ->
        $rootScope.$broadcast "requireSecondPassword", continueCallback
        
      success = () ->
        wallet.updateAccounts()  
        wallet.my.getHistoryAndParseMultiAddressJSON()
        
      error = () ->
        wallet.my.displayError("Unable to upgrade your wallet. Please try again.")
        wallet.my.initializeHDWallet(null, null, needsSecondPasswordCallback, success, error)
        
      wallet.my.initializeHDWallet(null, null, needsSecondPasswordCallback, success, error)  

    else if event == "did_multiaddr" # Transactions loaded
      wallet.updateTransactions()
      wallet.updateAccountsAndLegacyAddresses()  
      wallet.applyIfNeeded()
      
    else if event == "hw_wallet_balance_updated"
      wallet.updateAccountsAndLegacyAddresses()  
      wallet.applyIfNeeded()
    else if event == "did_update_legacy_address_balance"
      console.log "did_update_legacy_address_balance"
      wallet.updateLegacyAddresses()  
      wallet.applyIfNeeded()
      
    else if event == "wallet not found" # Only works in the mock atm
      $translate("WALLET_NOT_FOUND").then (translation) ->
        wallet.displayError(translation)
    else if event == "ticker_updated" || event == "did_set_latest_block"
      wallet.applyIfNeeded()
    else if event == "logging_out"
      if wallet.didLogoutByChoice == true
        $translate("LOGGED_OUT").then (translation) ->
          $cookieStore.put("alert-success", translation)
      else
        $translate("LOGGED_OUT_AUTOMATICALLY").then (translation) ->
          $cookieStore.put("alert-warning", translation)
          wallet.applyIfNeeded()
        
      wallet.status.isLoggedIn = false
      while wallet.accounts.length > 0
        wallet.accounts.pop()
      while wallet.transactions.length > 0
        wallet.transactions.pop()
      while wallet.paymentRequests.length > 0
        wallet.paymentRequests.pop()
      wallet.uid = ""
      wallet.password = ""
      # $state.go("dashboard")
    else if event == "ws_on_close" || event == "ws_on_open"
      # Do nothing
    else if event.type != undefined
      if event.type == "error"
        wallet.displayError(event.msg)
        # console.log event
        wallet.applyIfNeeded()
      else if event.type == "success"
        wallet.displaySuccess(event.msg)
        wallet.applyIfNeeded()
      else if event.type == "notice"
        wallet.displayWarning(event.msg)
        wallet.applyIfNeeded()
      else 
        # console.log event
    else
      # console.log event
  # The new monitoring system  
  wallet.monitor = (event) ->
    if event.type == "error"
      wallet.displayError(event.message)
      wallet.applyIfNeeded()
    else if event.type == "success"
      wallet.displaySuccess(event.message)
      wallet.applyIfNeeded()
    else if event.type == "notice"
      wallet.displayWarning(event.msg)
      wallet.applyIfNeeded()
    else 
      console.log event

  wallet.my.monitor((event) -> wallet.monitor(event))
  wallet.my.addEventListener((event, data) -> wallet.monitorLegacy(event, data))

  message = $cookieStore.get("alert-warning")
  if message != undefined && message != null
    wallet.displayWarning(message, true)
    $cookieStore.remove("alert-warning")
  
  message = $cookieStore.get("alert-success")
  if message != undefined && message != null
    wallet.displaySuccess(message)
    $cookieStore.remove("alert-success")
  
  ##################
  # Notes and tags #
  ##################
  wallet.setNote = (tx, text) ->
    wallet.my.setNote(tx.hash, text)
    
  wallet.deleteNote = (tx) ->
    wallet.my.deleteNote(tx.hash)

  ############
  # Settings #
  ############
  
  wallet.getLanguages = () ->
    # Get and sort languages:
    tempLanguages = []
  
    for code, name of wallet.my.getLanguages()
      language = {code: code, name: name}
      tempLanguages.push language
      
    tempLanguages = $filter('orderBy')(tempLanguages, "name")
  
    for language in tempLanguages
      wallet.languages.push language
      
      
  wallet.getCurrencies = () ->
    for code, name of wallet.my.getCurrencies()
      currency = {code: code, name: name}
      wallet.currencies.push currency
      
  wallet.getCurrency = () -> 
    wallet.my.getCurrency()

  wallet.setLanguage = (language) ->
    $translate.use(language.code)
    wallet.settings.language = language
    
  wallet.changeLanguage = (language) ->
    wallet.my.change_language(language.code)
    wallet.setLanguage(language)
    
  wallet.setCurrency = (currency) ->
    wallet.settings.currency = currency
    
  wallet.changeCurrency = (currency) ->
    wallet.my.change_local_currency(currency.code)
    wallet.setCurrency(currency)
    # wallet.fetchExchangeRate()
  
  wallet.changeEmail = (email) ->
    wallet.my.change_email(email, (()->
      wallet.user.email = email
      wallet.user.isEmailVerified = false
      wallet.applyIfNeeded()
    ), ()->
      $translate("CHANGE_EMAIL_FAILED").then (translation) ->
        wallet.displayError(translation) 
        wallet.applyIfNeeded()
    )
    
  wallet.setFeePolicy = (policy) ->
    wallet.my.setFeePolicy(policy)
    wallet.settings.feePolicy = policy  
  
  wallet.fetchExchangeRate = () ->
      # Exchange rate is loaded asynchronously:
      success = (result) ->
        for code, info of result
          # Converion:
          # result: units of fiat per BTC 
          # convert to: units of satoshi per unit of fiat
          wallet.conversions[code] = {symbol: info.symbol, conversion: parseInt(numeral(100000000).divide(numeral(info["15m"])).format("1"))}  
        
        if wallet.status.isLoggedIn
          wallet.updateAccountsAndLegacyAddresses()
        wallet.applyIfNeeded()

      fail = (error) ->
        console.log("Failed to load ticker:")
        console.log(error)
        
      wallet.my.get_ticker(success, fail)
    
  wallet.isEmailVerified = () ->
    wallet.my.isEmailVerified
    
  wallet.internationalPhoneNumber = (mobile) ->
    return null unless mobile?
    mobile.country + " " + mobile.number.replace(/^0*/, '')
    
  wallet.changeMobile = (mobile) ->
    wallet.my.changeMobileNumber(this.internationalPhoneNumber(mobile), (()->
      wallet.user.mobile = mobile
      wallet.user.isMobileVerified = false
      wallet.applyIfNeeded()
    ), ()->
      $translate("CHANGE_MOBILE_FAILED").then (translation) ->
        wallet.displayError(translation) 
        wallet.applyIfNeeded()
    )

  wallet.verifyMobile = (code) ->
    wallet.my.verifyMobile(code, (()->
      wallet.user.isMobileVerified = true
      wallet.applyIfNeeded()
    ), ()->
      $translate("VERIFY_MOBILE_FAILED").then (translation) ->
        wallet.displayError(translation)
        wallet.applyIfNeeded()
    )

  wallet.applyIfNeeded = () ->
    if MyWallet.mockShouldReceiveNewTransaction == undefined
      $rootScope.$apply()    
    
  wallet.changePasswordHint = (hint) ->
    wallet.my.update_password_hint1(hint,(()->
      wallet.user.passwordHint = hint
    ),(()->))
    
  wallet.isMobileVerified = () ->
    wallet.my.isMobileVerified
    
  wallet.disableSecondFactor = () ->
    wallet.my.unsetTwoFactor(()->
      wallet.settings.needs2FA = false
      wallet.settings.twoFactorMethod = null
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.setTwoFactorSMS = () ->
    wallet.my.setTwoFactorSMS(()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 5
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
  
  wallet.setTwoFactorEmail = () ->
    wallet.my.setTwoFactorEmail(()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 2
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
  
  wallet.setTwoFactorGoogleAuthenticator = () ->
    wallet.my.setTwoFactorGoogleAuthenticator((secret)->
      wallet.settings.googleAuthenticatorSecret = secret
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.confirmTwoFactorGoogleAuthenticator = (code) ->
    wallet.my.confirmTwoFactorGoogleAuthenticator(code, ()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 4
      wallet.settings.googleAuthenticatorSecret = null
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.handleBitcoinLinks = () ->
    $window.navigator.registerProtocolHandler('bitcoin', window.location.origin + '/#/open/%s', "Blockchain")
  
  wallet.enableBlockTOR = () ->
    wallet.my.update_tor_ip_block(true, ()->
      wallet.settings.blockTOR = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.disableBlockTOR = () ->
    wallet.my.update_tor_ip_block(false, ()->
      wallet.settings.blockTOR = false
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.getTotalBalanceForActiveLegacyAddresses = () ->
    return wallet.my.getTotalBalanceForActiveLegacyAddresses()
    
  wallet.setDefaultAccount = (account) ->
    wallet.my.setDefaultAccountIndex(account.index)
    wallet.updateAccounts()
    
  wallet.isValidBIP39Mnemonic = (mnemonic) ->
    wallet.my.isValidateBIP39Mnemonic(mnemonic)

  wallet.removeSecondPassword = () ->
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
      
    success = () ->
      wallet.displaySuccess("Second password has been removed.")
      wallet.settings.secondPassword = false
      
    error = () ->
    
    wallet.my.unsetSecondPassword(success, error, needsSecondPasswordCallback)
    
  wallet.setSecondPassword = (password) ->
    success = () ->
      wallet.displaySuccess("Second password set.")
      wallet.settings.secondPassword = true
    
    error = () ->
  
    wallet.my.setSecondPassword(password, success, error)
  
    
  ########################################
  # Testing: only works on mock MyWallet #
  ########################################
  
  wallet.refresh = () ->
    wallet.my.refresh()
    wallet.updateAccountsAndLegacyAddresses()
    wallet.updateTransactions()
    
  wallet.isMock = wallet.my.mockShouldFailToSend != undefined
  wallet.getLanguages()
  wallet.getCurrencies()
  
  return  wallet
