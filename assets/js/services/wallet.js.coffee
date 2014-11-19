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
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet, $rootScope, ngAudio, $cookieStore, $translate, $filter, $state) -> 
  wallet = {status: {isLoggedIn: false}, settings: {currency: null, language: null, needs2FA: null, twoFactorMethod: null}, user: {email: null, mobile: null, passwordHint: "", recoveryPhrase: ""}}
  
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
    
  wallet.needsTwoFactorCode = (method) ->
    wallet.settings.needs2FA = true
    # 2: Email
    # 3: Yubikey (depricated)
    # 4: Google Authenticator
    # 5: SMS
    
    wallet.settings.twoFactorMethod = method 
    $state.go("login")
    return
    
  wallet.wrongTwoFactorCode = (method) ->
    $state.go("login")
    return
  
  wallet.didLogin = () ->
    wallet.status.isLoggedIn = true 
    
    wallet.user.recoveryPhrase = wallet.my.getHDWallet().getPassphraseString()
    
    for address, label of wallet.my.addressBook
      wallet.addressBook[address] = wallet.my.addressBook[address]
    
    # Get email address, etc
    wallet.my.get_account_info((result)->
      wallet.user.email = result.email
      if result.sms_number
         wallet.user.mobile = {country: result.sms_number.split(" ")[0], number: "0" + result.sms_number.split(" ")[1]}
      else # Field is not present if not entered
        wallet.user.mobile = {country: "+1", number: ""}          
        
      wallet.user.isEmailVerified = result.email_verified 
      wallet.user.isMobileVerified = result.sms_verified
      wallet.user.passwordHint = result.password_hint1 # Field not present if not entered
      
      wallet.setLanguage($filter("getByProperty")("code", result.language, wallet.languages))
      
      # Get currencies:
      
      wallet.setCurrency($filter("getByProperty")("code", result.currency, wallet.currencies))
          
      wallet.fetchExchangeRate()
      wallet.applyIfNeeded()
    )
    
    wallet.applyIfNeeded()
    
  wallet.loginError = (error) ->
    console.log error
    $state.go("login")
    return
    
  wallet.login = (uid, password, two_factor_code) ->   
    if two_factor_code? && two_factor_code != ""
      wallet.settings.needs2FA = true
    else
      two_factor_code = undefined
    
      
    $window.root = "https://blockchain.info/"   
    wallet.my.fetchWalletJson(uid, null, null, password, two_factor_code, wallet.didLogin, wallet.needsTwoFactorCode, wallet.wrongTwoFactorCode, wallet.loginError ) 
    
  
    
  wallet.create = (password, email, currency, language, success_callback) ->      
    success = (uid) ->
      wallet.displaySuccess("Wallet created with identifier: " + uid)
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
    wallet.my.createAccount(name)
    wallet.updateAccountsAndLegacyAddresses()
    wallet.transactions.push []
    
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
  
  wallet.recommendedTransactionFeeForAccount = (idx, amount) ->
    # amount in Satoshi
    return wallet.my.recommendedTransactionFeeForAccount(idx, amount)
    
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
  
  
  # Amount in satoshi or fiat
  wallet.send         = (fromAccountIndex, to,             amount, currency, observer) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, observer)
    
    wallet.my.sendBitcoinsForAccount(fromAccountIndex, to, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError)
      
  wallet.sendInternal = (fromAccountIndex, toAccountIndex, amount, currency, observer) ->
    amount = wallet.checkAndGetTransactionAmount(amount, currency, observer)
    wallet.my.sendToAccount(fromAccountIndex, toAccountIndex, amount, 10000, null, wallet.transactionObserver(observer).transactionSuccess, wallet.transactionObserver(observer).transactionError)
      
  ####################
  # Payment requests #
  ####################
  
  wallet.accountForPaymentRequest = (request) ->
    for i in [0..wallet.my.getAccountsCount()-1]
      for req in wallet.my.getPaymentRequestsForAccount(i)
        return wallet.accounts[i] if request.address == req.address
      
    return -1
  
  wallet.refreshPaymentRequests = () ->
    # Flatten accounts::
    myWalletRequests = []
    i = 0
    for account in wallet.my.getAccounts()
      for request in account.getPaymentRequests()
        requestWithAddress = angular.copy(request)
        requestWithAddress.address =  account.getAddressForPaymentRequest(request)
        requestWithAddress.account = i
        myWalletRequests.push angular.copy(requestWithAddress)
      i++
                  
    # Update existing amounts, remove deleted addresses:
    len = wallet.paymentRequests.length
    while len--
      req = wallet.paymentRequests[len]
      match = false
      for candidate in myWalletRequests
        if candidate.address == req.address
          req.amount = candidate.amount
          match = true
          
      if !match
        index = wallet.paymentRequests.indexOf(req)
        wallet.paymentRequests.splice(index,1)
      
    # Add new ones:
    for req in myWalletRequests
      match = false
      for candidate in wallet.paymentRequests
        if candidate.address == req.address
          match = true
          # Update amount and payment
          candidate.amount = req.amount
          candidate.paid = req.paid
          candidate.complete = req.complete
          candidate.canceled = req.canceled 
          break
      
      if !match
        request = angular.copy(req)
        request.amount = request.amount
        wallet.paymentRequests.push request
            
  # Amount in Satoshi
  wallet.generatePaymentRequestForAccount = (accountIndex, amount)  ->
    account = wallet.my.getAccounts()[accountIndex]
    request = account.generatePaymentRequest(amount)
    request.address = account.getAddressForPaymentRequest(request)
    this.refreshPaymentRequests()
    return wallet.getPaymentRequest(accountIndex, request.address)
  
  wallet.getPaymentRequest = (accountIndex, address) ->    
    for request in wallet.paymentRequests
      return request if request.address == address
      
    return false
  
  wallet.cancelPaymentRequest = (accountIndex, address)  ->
    success = wallet.my.cancelPaymentRequestForAccount(accountIndex, address)
    this.refreshPaymentRequests()
    return success 
      
  wallet.updatePaymentRequest = (accountIndex, address, amount) ->
    if wallet.my.updatePaymentRequestForAccount(accountIndex, address, amount)
      this.refreshPaymentRequests()
    else 
      console.error "Failed to update request"
    return
    
  wallet.acceptPaymentRequest = (accountIndex, address) ->
    wallet.my.acceptPaymentRequestForAccount(accountIndex, address)
    this.refreshPaymentRequests() 
    
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
        
  ##################################
  #        Private (other)         #
  ##################################
  
  wallet.updateAccountsAndLegacyAddresses = () ->
    # Carefully update our array of accounts, so Angular watchers don't get confused.
    # Assuming accounts are never deleted.
    
    numberOfOldAccounts = wallet.accounts.length
    numberOfNewAccounts = wallet.my.getAccountsCount()
    
    for i in [0..(numberOfNewAccounts - 1)]
      if i >= numberOfOldAccounts
        wallet.accounts.push {active: true, legacy: false, index: i}
      
      # Set or update label and balance:
      wallet.accounts[i].label = wallet.my.getLabelForAccount(i)
      wallet.accounts[i].balance = wallet.my.getBalanceForAccount(i)
      
    numberOfOldAddresses = wallet.legacyAddresses.length
    numberOfNewAddresses = wallet.my.getAllAddresses().length
    
    if numberOfNewAddresses > 0
      for i in [0..(numberOfNewAddresses - 1)]
        addressItem = undefined
        if i >= numberOfOldAddresses
          address = wallet.my.getAllAddresses()[i]
          addressItem = {address: address, active: wallet.my.getActiveAddresses().indexOf(address) == -1, legacy: true} 
          wallet.legacyAddresses.push addressItem
        else
          addressItem = wallet.legacyAddresses[i]
      
        # Set or update label and balance:
        addressItem.label = wallet.my.getAddressLabel(addressItem.address)
        addressItem.balance = 0 # wallet.my.getBalanceForLegacyAddress(address_item.address)
        addressItem.isWatchOnly = wallet.my.isWatchOnly(addressItem.address)
      
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
    else
      account = wallet.accounts[parseInt(accountIndex)]
      return null if account == undefined
      return account.balance
    
  wallet.updateTransactions = () ->
    for i in [0..wallet.my.getAccountsCount()-1]
      for tx in wallet.my.getTransactionsForAccount(i)
        match = false
        for candidate in wallet.transactions
          if candidate.hash == tx.hash
            match = true
            break
      
        if !match
          transaction = angular.copy(tx)
          transaction.note = wallet.my.getNote(transaction.hash)
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
    else if event == "hw_wallet_accepted_payment_request"
      $translate("PAYMENT_REQUEST_RECEIVED",{amount: numeral(data.amount).divide(100000000).format("0.[00000000]")}).then (translation) ->
        wallet.displaySuccess(translation)
      wallet.refreshPaymentRequests()
    else if event == "hw_wallet_payment_request_received_too_little"
      $translate("PAYMENT_REQUEST_RECEIVED_TOO_LITTLE",{amountReceived: numeral(data.amountReceived).divide(100000000).format("0.[00000000]"), amountRequested: numeral(data.amountRequested).divide(100000000).format("0.[00000000]") }).then (translation) ->
        wallet.displayWarning(translation)
      wallet.refreshPaymentRequests()
    else if event == "hw_wallet_payment_request_received_too_much"
      $translate("PAYMENT_REQUEST_RECEIVED_TOO_MUCH",{amountReceived: numeral(data.amountReceived).divide(100000000).format("0.[00000000]"), amountRequested: numeral(data.amountRequested).divide(100000000).format("0.[00000000]") }).then (translation) ->
        wallet.displayWarning(translation)
      wallet.refreshPaymentRequests()
    else if event == "error_restoring_wallet"
      wallet.applyIfNeeded()      
    else if event == "did_set_guid" # Wallet retrieved from server
    else if event == "on_wallet_decrypt_finish" # Non-HD part is decrypted
      hdwallet = MyWallet.getHDWallet()
      wallet.applyIfNeeded()
    else if event == "hd_wallets_does_not_exist"
      # Create a new one:
      console.log "Creating new HD wallet..."
      wallet.my.initializeHDWallet()
    else if event == "did_multiaddr" # Transactions loaded
      wallet.updateTransactions()
      wallet.refreshPaymentRequests()
      wallet.applyIfNeeded()
      
    else if event == "hw_wallet_balance_updated"
      wallet.updateAccountsAndLegacyAddresses()  
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
    else if event.type != undefined
      if event.type == "error"
        wallet.displayError(event.msg)
        console.log event
        wallet.applyIfNeeded()
      else if event.type == "success"
        wallet.displaySuccess(event.msg)
        wallet.applyIfNeeded()
      else if event.type == "notice"
        wallet.displayWarning(event.msg)
        wallet.applyIfNeeded()
      else 
        console.log event
    else
      console.log event
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
    
  wallet.fetchExchangeRate = () ->
      # Exchange rate is loaded asynchronously:
      success = (result) ->
        for code, info of result
          # Converion:
          # result: units of fiat per BTC 
          # convert to: units of satoshi per unit of fiat
          wallet.conversions[code] = {symbol: info.symbol, conversion: parseInt(numeral(100000000).divide(numeral(info["15m"])).format("1"))}  

        wallet.updateAccountsAndLegacyAddresses()
        wallet.applyIfNeeded()

      fail = (error) ->
        console.log(error)
        
      wallet.my.get_ticker(success, fail)
    
  wallet.isEmailVerified = () ->
    wallet.my.isEmailVerified
    
  wallet.internationalPhoneNumber = (mobile) ->
    return null unless mobile?
    mobile.country + " " + mobile.number.replace(/^0+/, '')
    
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
