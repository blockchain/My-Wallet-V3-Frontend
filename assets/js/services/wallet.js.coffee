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
  wallet = {
    goal: {}, 
    status: {isLoggedIn: false, didUpgradeToHd: null, didLoadTransactions: false, didLoadBalances: false, legacyAddressBalancesLoaded: false, didConfirmRecoveryPhrase: false}, 
    settings: {currency: null, language: null, needs2FA: null, twoFactorMethod: null, feePolicy: null, handleBitcoinLinks: false, blockTOR: null, rememberTwoFactor: null, secondPassword: null, ipWhitelist: null, apiAccess: null, restrictToWhitelist: null}, 
    user: {current_ip: null, email: null, mobile: null, passwordHint: ""}
  }
  
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
  wallet.hdAddresses = []
    
  ##################################
  #             Public             #
  ##################################
    
  wallet.login = (uid, password, two_factor_code, needsTwoFactorCallback, successCallback, errorCallback) ->  
    didLogin = () ->    
      wallet.status.isLoggedIn = true 
      wallet.status.didUpgradeToHd = wallet.my.didUpgradeToHd()
      wallet.status.didConfirmRecoveryPhrase = wallet.my.isMnemonicVerified()
    
      for address, label of wallet.my.getAddressBook()
        wallet.addressBook[address] = label
            
      if wallet.my.didUpgradeToHd()
        wallet.updateAccounts()
      
      wallet.settings.secondPassword = wallet.my.getDoubleEncryption()
      wallet.settings.pbkdf2 = wallet.my.getPbkdf2Iterations()    
            
      # Get email address, etc
      # console.log "Getting info..."
      wallet.my.get_account_info((result)->
        # console.log result
        $window.name = "blockchain-"  + result.guid
        wallet.settings.ipWhitelist = result.ip_lock
        wallet.settings.restrictToWhitelist = result.ip_lock_on
        wallet.settings.apiAccess = result.is_api_access_enabled
        wallet.settings.rememberTwoFactor = !result.never_save_auth_type
        wallet.settings.needs2FA = result.auth_type != 0
        wallet.settings.twoFactorMethod = result.auth_type
        wallet.user.email = result.email
        wallet.user.current_ip = result.my_ip
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
        if wallet.my.didUpgradeToHd()
          wallet.my.getHistoryAndParseMultiAddressJSON()
      
        wallet.applyIfNeeded()
      )
      
      if successCallback?
        successCallback()
    
      wallet.applyIfNeeded()
  
    needsTwoFactorCode = (method) ->
      wallet.displayWarning("Please enter your 2FA code")
      wallet.settings.needs2FA = true
      # 2: Email
      # 3: Yubikey (depricated)
      # 4: Google Authenticator
      # 5: SMS
      
      needsTwoFactorCallback()
  
      wallet.settings.twoFactorMethod = method 
      $state.go("login.show")
      return
      
    wrongTwoFactorCode = (method) ->
      $state.go("login.show")
      return
  
    loginError = (error) ->
      console.log(error)
      wallet.displayError(error)
      
      if observer?
        errorCallback()
      else
        $state.go("login.show")
      
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
    wallet.my.fetchWalletJson(uid, null, null, password, two_factor_code, didLogin, needsTwoFactorCode, wrongTwoFactorCode, authorizationRequired, loginError ) 
    
    wallet.fetchExchangeRate()
  
    
  wallet.create = (password, email, currency, language, success_callback) ->      
    success = (uid) ->
      wallet.displaySuccess("Wallet created with identifier: " + uid, true)
      
      loginSuccess = () ->
        success_callback(uid)
        
      loginError = (error) ->
        console.log(error)
        wallet.displayError("Unable to login to new wallet")
      
      wallet.login(uid, password, null, null, loginSuccess, loginError)
    
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
        
  wallet.createAccount = (name, successCallback) ->
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
      
    success = () ->
      wallet.updateAccounts()  
      wallet.my.getHistoryAndParseMultiAddressJSON()
      successCallback()
      
    error = () ->
    
    wallet.my.createAccount(name, needsSecondPasswordCallback, success, error)
  
  wallet.renameAccount = (account, name) ->
    wallet.my.setLabelForAccount(account.index, name)
    wallet.updateAccountsAndLegacyAddresses()
    
  wallet.addAddressForAccount = (account, successCallback, errorCallback) ->        
    labeledReceivingAddresses = wallet.my.getLabeledReceivingAddressesForAccount(account.index)
            
    # Add a new address rather than reuse the first one if no labeled addresses exist. This requires
    # labeling the first address as well.
    if labeledReceivingAddresses.length == 0
      firstAvailableReceivingAddressIdx = wallet.my.getReceivingAddressIndexForAccount(account.index)
            
      wallet.my.setLabelForAccountAddress(account.index, firstAvailableReceivingAddressIdx, "", (()->), (()->))
       
    firstAvailableReceivingAddressIdx = wallet.my.getReceivingAddressIndexForAccount(account.index)
                    
    success = () ->
      wallet.updateHDaddresses()
      address = wallet.my.getLabeledReceivingAddressesForAccount(account.index).slice(-1)[0]
      successCallback(address)
      
    error = () ->
      console.log "fail"
      errorCallback()
    
    wallet.my.setLabelForAccountAddress(account.index, firstAvailableReceivingAddressIdx, "", success, error)
    
    
    
  wallet.changeAddressLabel = (address, label, successCallback, errorCallback) ->
    if address.account? # HD Address
      success = () ->
         wallet.updateHDaddresses()
         successCallback()
         
      wallet.my.setLabelForAccountAddress(address.account.index, address.index, label, success, errorCallback)
    else # Legacy address
      success = () ->
        address.label = label
        successCallback()
        
      wallet.my.setLegacyAddressLabel(address.address, label, success, errorCallback)
    
  wallet.logout = () ->
    wallet.didLogoutByChoice = true
    $window.name = "blockchain"
    wallet.my.logout() # broadcast "logging_out"
    
  wallet.makePairingCode = (successCallback, errorCallback) ->
    success = (code) ->
      successCallback(code)
      wallet.applyIfNeeded()
      
    error = () ->
      errorCallback()
      wallet.applyIfNeeded()
    
    wallet.my.makePairingCode(success, error)
    
  wallet.confirmRecoveryPhrase = () ->
    wallet.my.didVerifyMnemonic()
    wallet.status.didConfirmRecoveryPhrase = true

  wallet.isCorrectMainPassword = (candidate) ->
    wallet.my.isCorrectMainPassword(candidate)
    
  wallet.isCorrectSecondPassword = (candidate) ->
    return true
    # wallet.my.isCorrectSecondPassword(candidate)
    
  wallet.changePassword = (newPassword) ->
    wallet.my.changePassword(newPassword, (()-> 
      $translate("CHANGE_PASSWORD_SUCCESS").then (translation) ->
        wallet.displaySuccess(translation)
    ),() ->
      $translate("CHANGE_PASSWORD_FAILED").then (translation) ->
        wallet.displayError(translation) 
    )
    
  wallet.setIPWhitelist = (ips, successCallback, errorCallback) ->
    success = () ->
      wallet.settings.ipWhitelist = ips
      successCallback()
      wallet.applyIfNeeded()
     
    error = () ->
      errorCallback() 
      wallet.applyIfNeeded()
      
    wallet.my.setIPWhitelist(ips, success, error)
  
  wallet.verifyEmail = (code, successCallback, errorCallback) ->
    success = () ->
      wallet.user.isEmailVerified = true
      successCallback()
      wallet.applyIfNeeded()
      
    wallet.my.verifyEmail(code, success, errorCallback) 
    
  wallet.resendEmailConfirmation = (successCallback, errorCallback) ->
    success = () ->
      successCallback()
      wallet.applyIfNeeded()
     
    error = () ->
      errorCallback()
      wallet.applyIfNeeded()
      
    wallet.my.resendEmailConfirmation(wallet.user.email, success, error)
    
  wallet.setPbkdf2Iterations = (n, successCallback, errorCallback) ->    
    needsSecondPassword = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
    
    success = () ->
      wallet.settings.pbkdf2 = wallet.my.getPbkdf2Iterations()
      successCallback()
      
    error = (error) ->
      errorCallback(error)
      
    wallet.my.setPbkdf2Iterations(parseInt(n), success, error, needsSecondPassword)
    
  ####################
  #   Transactions   #
  ####################
  
  wallet.recommendedTransactionFee = (origin, amount) ->
    # amount in Satoshi
    if !origin?
      return null
    
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
  
  wallet.transactionObserver = (success, error) ->    
    o = {}
    
    o.transactionSuccess = () ->
        wallet.updateTransactions()
        wallet.updateAccountsAndLegacyAddresses()
    
        success()
      
    o.transactionError = (e) ->
        if e.message != undefined
          error(e.message)
        else if e isnt null
          error(e)
          wallet.applyIfNeeded()
        else
          error("Unknown error")
          wallet.applyIfNeeded() 
          
    o.needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback
          
    return o
        
  wallet.checkAndGetTransactionAmount = (amount, currency, success, error) ->
    if currency != "BTC"
      amount = wallet.fiatToSatoshi(amount, currency)
    else 
      amount = parseInt(numeral(amount).multiply(100000000).format("0"))
    
    if !success? || !error?
      console.error "Success and error callbacks are required"
      return
            
    return amount

  wallet.addAddressOrPrivateKey = (addressOrPrivateKey, needsBip38, successCallback, errorCallback) ->
    if addressOrPrivateKey == ""
      errorCallback({invalidInput: true})
      return
            
    needsSecondPasswordCallback = (continueCallback) ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback   
      
    needsBip38Password = (callback) ->
      needsBip38(callback)
        
    if address = wallet.my.isValidPrivateKey(addressOrPrivateKey)
      privateKey = addressOrPrivateKey
      if wallet.my.legacyAddressExists(address)
        address = $filter("getByProperty")("address", address, wallet.legacyAddresses)
        if address.isWatchOnlyLegacyAddress
          success = (address) ->
            wallet.updateLegacyAddresses() # Probably too early
            successCallback({address: address})
            
          error = (error) ->
            console.log "Error adding new key to existing address"
            console.log error
            
          wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, needsBip38Password, success, error)
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
          
        error = (error) ->
          console.log "Error importing new key"
          console.log error
          wallet.displayError(error)
        
        wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, needsBip38Password, success, error)
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
        
  wallet.send = (from, destination, amount, currency, success, error) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, success, error)
    
    if from.address?
      if destination.index?
        wallet.my.sendFromLegacyAddressToAccount(from.address, destination.index, amount, 10000, null, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback)
      else if destination.address?
        wallet.my.sendFromLegacyAddressToAddress(from.address, destination.address, amount, 10000, null, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback)
    else if from.index?
      if destination.index?
        wallet.my.sendToAccount(from.index, destination.index, amount, 10000, null, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback)
      else if destination.address?
        wallet.my.sendBitcoinsForAccount(from.index, destination.address, amount, 10000, null, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback)
      
      
  wallet.sweepLegacyAddressToAccount = (fromAddress, toAccountIndex, success, error) ->
    wallet.my.sweepLegacyAddressToAccount(fromAddress.address, toAccountIndex, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback)
    wallet.updateLegacyAddresses() # Probably too early  
      
  wallet.sendToEmail = (fromAccountIndex, email, amount, currency, success, error) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, success, error)
    wallet.my.sendToEmail(fromAccountIndex, amount, 10000, email, wallet.transactionObserver(success, error).transactionSuccess, wallet.transactionObserver(success, error).transactionError, wallet.transactionObserver(success, error).needsSecondPasswordCallback) 
      
  wallet.redeemFromEmailOrMobile = (account, claim, successCallback, error) ->
    success = () ->
      wallet.updateAccounts()
      wallet.updateTransactions()
      successCallback()
    
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
    else
      # Check if it's just a bitcoin address
      if wallet.my.isValidAddress(url)
        result.address = url
        result.isValid = true
    
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
    
  wallet.archive = (address_or_account) ->
    if address_or_account.address?
      wallet.my.archiveLegacyAddr(address_or_account.address)
    else
      wallet.my.archiveAccount(address_or_account.index)
      
    address_or_account.active = false
    
  wallet.unarchive = (address_or_account) ->
    if address_or_account.address?
      wallet.my.unArchiveLegacyAddr(address_or_account.address)
    else
      wallet.my.unarchiveAccount(address_or_account.index)
    
    address_or_account.active = true
        
  wallet.deleteLegacyAddress = (address) ->
    wallet.my.deleteLegacyAddress(address.address)
    idx = wallet.legacyAddresses.indexOf(address)
    wallet.legacyAddresses.splice(idx,1)
    
        
  ##################################
  #        Private (other)         #
  ##################################
  
  wallet.updateAccountsAndLegacyAddresses = () ->
    if wallet.my.didUpgradeToHd()
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
        
    wallet.status.didLoadBalances = true if wallet.accounts? && wallet.accounts.length > 0 && wallet.accounts[0].balance?
      
  # Update (labelled) HD addresses:      
  wallet.updateHDaddresses = () ->
    
    for account in wallet.accounts
      labeledAddresses = wallet.my.getLabeledReceivingAddressesForAccount(account.index)
      for address in labeledAddresses
        hdAddress = $filter("getByProperty")("address", address.address, wallet.hdAddresses)
        if hdAddress == null
          wallet.hdAddresses.push {
            index: address.index
            address: address.address
            label: address.label
            accountLabel: account.label
            account: account
          }
        else
          hdAddress.label = address.label
          
      if labeledAddresses.length == 0            
        address = wallet.my.getReceivingAddressForAccount(account.index)
        if $filter("getByProperty")("address", address, wallet.hdAddresses) == null
          wallet.hdAddresses.push {
            index: wallet.my.getReceivingAddressIndexForAccount(account.index)
            address: address
            label: null # The last receiving address never has a label
            accountLabel: account.label
            account: account
          }
                        
  wallet.updateLegacyAddresses = () ->
    numberOfOldAddresses = wallet.legacyAddresses.length
    numberOfNewAddresses = wallet.my.getAllLegacyAddresses().length
    
    if numberOfNewAddresses == 0
      wallet.status.legacyAddressBalancesLoaded = true # No legacy addresses, so all balances are loaded
    
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
        
        if addressItem.balance != null
          wallet.status.legacyAddressBalancesLoaded = true
      
    # Balances will be 0 until transactions have been loaded.
    # TODO: MyWallet should let us know when all transactions are loaded; hide
    # total until that time.
    
        
  wallet.total = (accountIndex) -> 
    return null if wallet.accounts == undefined || wallet.accounts.length == 0
    if !(accountIndex?) || accountIndex == "accounts"
      return null if wallet.accounts[0].balance == null
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
          
        wallet.transactions.push transaction 
    wallet.status.didLoadTransactions = true
          
  ####################
  # Notification     #
  ####################
            
  wallet.monitor = (event, data) ->
    # console.logaccountsd: " + event
    if event == "on_tx" or event == "on_block"
      before = wallet.transactions.length
      wallet.updateTransactions()
      if wallet.transactions.length > before
        sound = ngAudio.load("beep.wav")
        sound.play()
        wallet.updateAccountsAndLegacyAddresses()
    else if event == "error_restoring_wallet"
      wallet.applyIfNeeded()      
    else if event == "did_set_guid" # Wallet retrieved from server
    else if event == "on_wallet_decrypt_finish" # Non-HD part is decrypted
    else if event == "hd_wallets_does_not_exist"
      wallet.status.didUpgradeToHd = false
      continueCallback = () ->
        needsSecondPasswordCallback = (continueCallback) ->
          $rootScope.$broadcast "requireSecondPassword", continueCallback, true
        
        success = () ->
          wallet.status.didUpgradeToHd = true
          wallet.updateAccounts()  
          wallet.my.getHistoryAndParseMultiAddressJSON()
        
        error = () ->
          wallet.displayError("Unable to upgrade your wallet. Please try again.")
          wallet.my.upgradeToHDWallet(needsSecondPasswordCallback, success, error)
        
        wallet.my.upgradeToHDWallet(needsSecondPasswordCallback, success, error)
      
      $timeout(()->
        $rootScope.$broadcast "needsUpgradeToHD", continueCallback
        , 1000
      )
      
    else if event == "did_multiaddr" # Transactions loaded
      wallet.updateTransactions()
      wallet.updateAccountsAndLegacyAddresses()  
      wallet.updateHDaddresses()
      wallet.applyIfNeeded()
      
    else if event == "hd_wallet_balance_updated"
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
      # $state.go("wallet.common.dashboard")
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

  wallet.my.addEventListener((event, data) -> wallet.monitor(event, data))

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
  
  wallet.changeEmail = (email, successCallback, errorCallback) ->
    wallet.my.change_email(email, (()->
      wallet.user.email = email
      wallet.user.isEmailVerified = false
      successCallback()
      wallet.applyIfNeeded()
    ), ()->
      $translate("CHANGE_EMAIL_FAILED").then (translation) ->
        wallet.displayError(translation) 
        wallet.applyIfNeeded()
        
      errorCallback()
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
          wallet.conversions[code] = {symbol: info.symbol, conversion: parseInt(numeral(100000000).divide(numeral(info["last"])).format("1"))}  
        
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
    
  wallet.changePasswordHint = (hint, successCallback, errorCallback) ->
    wallet.my.update_password_hint1(hint,(()->
      wallet.user.passwordHint = hint
      successCallback()
      wallet.applyIfNeeded()
    ),()->
      errorCallback()
      wallet.applyIfNeeded()
    )
    
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
    
  wallet.enableRememberTwoFactor = (successCallback, errorCallback) ->
    success = () ->
      wallet.settings.rememberTwoFactor = true
      successCallback()
      wallet.applyIfNeeded()
      
    error = () ->
      errorCallback()
      wallet.applyIfNeeded()
      
    wallet.my.enableSaveTwoFactor(success, error)
    
  wallet.disableRememberTwoFactor = (successCallback, errorCallback) ->
    success = () ->
      wallet.settings.rememberTwoFactor = false
      successCallback()
      wallet.applyIfNeeded()
    
    error = () ->
      errorCallback()
      wallet.applyIfNeeded()
      
    wallet.my.disableSaveTwoFactor(success, error)
    
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
    
  wallet.enableApiAccess = () ->
    wallet.my.enableApiAccess(()->
      wallet.settings.apiAccess = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.disableApiAccess = () ->
    wallet.my.disableApiAccess(()->
      wallet.settings.apiAccess = false
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )  
  
  wallet.enableRestrictToWhiteListedIPs = () ->
    wallet.my.enableRestrictToWhiteListedIPs(()->
      wallet.settings.restrictToWhitelist = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )
    
  wallet.disableRestrictToWhiteListedIPs = () ->
    wallet.my.disableRestrictToWhiteListedIPs(()->
      wallet.settings.restrictToWhitelist = false
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
