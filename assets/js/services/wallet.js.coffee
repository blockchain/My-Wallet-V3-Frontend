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
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet, $rootScope, ngAudio, $cookieStore, $translate, $filter) -> 
  wallet = {status: {isLoggedIn: false}, settings: {currency: {conversion: 0}, language: null}, user: {email: null, mobile: null}}
  
  wallet.accounts     = []
  wallet.addressBook  = {}
  wallet.paymentRequests = []
  wallet.alerts = []
  wallet.my = MyWallet
  wallet.transactions = []
    
  ##################################
  #             Public             #
  ##################################
    
  wallet.login = (uid, password) ->    
    $window.root = "https://blockchain.info/"   
    wallet.password = password
    wallet.my.setGUID(uid) 
    
  wallet.create = (uid, password) ->
    success = () ->
      wallet.displaySuccess("Wallet created")
      wallet.login(uid, password)
    
    error = (error) ->
      if error.message != undefined
        wallet.displayError(error.message)
      else
        wallet.displayError(error)
      
    wallet.my.register(uid, password, success, error)
        
  wallet.createAccount = () ->
    wallet.my.createAccount( "Account #" + (wallet.accounts.length + 1))
    wallet.transactions.push []
    wallet.updateAccounts()
    
  wallet.logout = () ->
    wallet.didLogoutByChoice = true
    wallet.my.logout() # broadcast "logging_out"

  wallet.isCorrectMainPassword = (candidate) ->
    wallet.my.isCorrectMainPassword(candidate)
    
  wallet.changePassword = (newPassword) ->
    wallet.my.changePassword(newPassword)
  
  ####################
  #   Transactions   #
  ####################
  
  wallet.recommendedTransactionFeeForAccount = (idx, amount) ->
    # amount in Satoshi
    return numeral(wallet.my.recommendedTransactionFeeForAccount(idx, parseInt(amount.format("1"))))
    
  #############
  # Spend BTC #
  #############
  
  # Amount in BTC (TODO: convert currency)
  wallet.send = (fromAccountIndex, to, amount, currency, observer) ->
    if observer == undefined || observer == null
      console.error "An observer is required"
      return
      
    if observer.transactionDidFailWithError == undefined
      console.error "Observer should implement transactionDidFailWithError"
      return
      
    if observer.transactionDidFinish == undefined
      console.error "Observer should implement transactionDidFinish"
      return
      
    # listener = {}
    # listener.on_error = (e) ->
    #   if e.message != undefined
    #     observer.transactionDidFailWithError(e.message)
    #   else if e isnt null
    #     observer.transactionDidFailWithError(e)
    #     $rootScope.$apply()
    #   else
    #     observer.transactionDidFailWithError("Unknown error")
    #     $rootScope.$apply()
    #
    # listener.on_start = () ->
    #   return
    #
    # listener.on_begin_signing = () ->
    #   return
    #
    # listener.on_sign_progress = () ->
    #   return
    #
    # listener.on_finish_signing = () ->
    #   return
    #
    # listener.on_before_send = () ->
    #   return
    #
    # listener.on_success = () ->
    #   wallet.updateAccounts()
    #   wallet.updateAccounts()
    #
    #   observer.transactionDidFinish()
      
    success = () ->
      wallet.updateAccounts()
      wallet.updateTransactions()
    
      observer.transactionDidFinish()
      
    error = (e) ->
      if e.message != undefined
        observer.transactionDidFailWithError(e.message)
      else if e isnt null
        observer.transactionDidFailWithError(e)
        $rootScope.$apply()
      else
        observer.transactionDidFailWithError("Unknown error")
        $rootScope.$apply()
    
    wallet.my.sendBitcoinsForAccount(fromAccountIndex, to, parseInt(amount.multiply(100000000).format("1")), 10000, null, success, error)
      
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
    for i in [0..wallet.my.getAccountsCount() - 1]
      for request in wallet.my.getPaymentRequestsForAccount(i)
        myWalletRequests.push angular.copy(request)
    
    # Update existing amounts, remove deleted addresses:
    len = wallet.paymentRequests.length
    while len--
      req = wallet.paymentRequests[len]
      match = false
      for candidate in myWalletRequests
        if candidate.address == req.address
          req.amount = numeral(candidate.amount)
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
          candidate.amount = numeral(req.amount)
          candidate.paid = numeral(req.paid)
          candidate.complete = req.complete
          candidate.canceled = req.canceled 
          break
      
      if !match
        request = angular.copy(req)
        request.amount = numeral(request.amount)
        request.account = 0 # TODO: match the correct account
        wallet.paymentRequests.push request
            
  # Amount in Satoshi
  wallet.generatePaymentRequestForAccount = (accountIndex, amount)  ->
    request = wallet.my.generatePaymentRequestForAccount(accountIndex, parseInt(amount.format("1")))
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
    if wallet.my.updatePaymentRequestForAccount(accountIndex, address, parseInt(amount.format("1")))
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
  
  wallet.updateAccounts = () ->
    # Carefully update our array of accounts, so Angular watchers don't get confused.
    # Assuming accounts are never deleted.
    
    numberOfOldAccounts = wallet.accounts.length
    numberOfNewAccounts = wallet.my.getAccountsCount()
    
    for i in [0..(numberOfNewAccounts - 1)]
      if i >= numberOfOldAccounts
        wallet.accounts.push {active: true}
      
      # Set or update label and balance:
      wallet.accounts[i].label = wallet.my.getLabelForAccount(i)
      wallet.accounts[i].balance = numeral(wallet.my.getBalanceForAccount(i))
      
    # Balances will be 0 until transactions have been loaded.
    # TODO: MyWallet should let us know when all transactions are loaded; hide
    # total until that time.
    
  wallet.total_btc = (accountIndex) -> 
    return null if wallet.accounts == undefined
    if !(accountIndex?) || accountIndex == ""
      tally = numeral("0.0")
      for account in wallet.accounts
        return null if account.balance == undefined
        tally = tally.add(account.balance)
      
      return tally
    else
      account = wallet.accounts[parseInt(accountIndex)]
      return null if account == undefined
      return account.balance
      
  wallet.total_fiat = (accountIndex) -> 
    return null if wallet.settings.currency.conversion == undefined
    btc = wallet.total_btc(accountIndex)
    return null if btc == undefined || btc == null
    return btc.clone().divide(wallet.settings.currency.conversion)
    
  wallet.updateTransactions = () ->
    for i in [0..wallet.my.getAccountsCount()-1]
      for tx in wallet.my.getTransactionsForAccount(i)
        match = false
        for candidate in wallet.transactions
          if candidate.hash == tx.hash
            candidate.fiat = candidate.amount.clone().divide(wallet.settings.currency.conversion)
            match = true
            break
      
        if !match
          transaction = {}
          transaction = angular.copy(tx)
          transaction.amount = numeral(tx.amount)
          unless wallet.settings.currency == undefined
            transaction.fiat = transaction.amount / wallet.settings.currency.conversion
          wallet.transactions.push transaction 
          
    # console.log wallet.transactions
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
        wallet.updateAccounts()
        wallet.updateTransactions()
    else if event == "hw_wallet_accepted_payment_request"
      $translate("PAYMENT_REQUEST_RECEIVED",{amount: numeral(data.amount).clone().divide(100000000).format("0.[00000000]")}).then (translation) ->
        wallet.displaySuccess(translation)
      wallet.refreshPaymentRequests()
    else if event == "hw_wallet_payment_request_received_too_little"
      $translate("PAYMENT_REQUEST_RECEIVED_TOO_LITTLE",{amountReceived: numeral(data.amountReceived).clone().divide(100000000).format("0.[00000000]"), amountRequested: numeral(data.amountRequested).clone().divide(100000000).format("0.[00000000]") }).then (translation) ->
        wallet.displayWarning(translation)
      wallet.refreshPaymentRequests()
    else if event == "hw_wallet_payment_request_received_too_much"
      $translate("PAYMENT_REQUEST_RECEIVED_TOO_MUCH",{amountReceived: numeral(data.amountReceived).clone().divide(100000000).format("0.[00000000]"), amountRequested: numeral(data.amountRequested).clone().divide(100000000).format("0.[00000000]") }).then (translation) ->
        wallet.displayWarning(translation)
      wallet.refreshPaymentRequests()
    else if event == "error_restoring_wallet"
      $rootScope.$apply()        
    else if event == "did_set_guid" # Wallet retrieved from server
      wallet.my.restoreWallet(wallet.password)
      wallet.password = undefined
  
      # Exchange rate is loaded asynchronously:
      success = (result) ->
        # TODO: get currency info from result to avoid using $window
        wallet.settings.currency = $window.symbol_local
                
        if wallet.status.isLoggedIn
          # Update transactions and accounts, in case this gets called after did_multi_address
          wallet.updateTransactions()     
          wallet.updateAccounts()  
                  
          for address, label of wallet.my.addressBook
            wallet.addressBook[address] = wallet.my.addressBook[address]
          
          wallet.refreshPaymentRequests()
        
          if MyWallet.mockShouldReceiveNewTransaction == undefined
            $rootScope.$apply()
        
        
      fail = (error) ->
        console.log(error)
        
      wallet.my.get_ticker(success, fail)
      
      if $rootScope.isMock ||  wallet.my.getEmail != undefined
        wallet.user.email = wallet.my.getEmail()
      else
        wallet.user.email = "under@contructi.on"
        
      if $rootScope.isMock ||  wallet.my.getMobile != undefined
        wallet.user.mobile = wallet.my.getMobile()
      else
        wallet.user.mobile = "+1800UNDERCONSTRUCTION"
        
      wallet.user.isEmailVerified = wallet.my.isEmailVerified 
      wallet.user.isMobileVerified = wallet.my.isMobileVerified 
  
      # Checks if we already have an HD wallet. If not, create one.
      hdwallet = MyWallet.getHDWallet()
      
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "on_wallet_decrypt_finish" # Non-HD part is decrypted
      # Get language:
      code =  wallet.my.getLanguage()
      language = $filter('getByProperty')('code', code, wallet.languages)
      wallet.setLanguage(language)
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "did_decrypt"   # Wallet decrypted succesfully  
      wallet.status.isLoggedIn = true 
      wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "hd_wallets_does_not_exist"
      # Create a new one:
      console.log "Creating new HD wallet..."
      wallet.my.initializeHDWallet()
    else if event == "did_multiaddr" # Transactions loaded
      wallet.updateTransactions()
      wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "hw_wallet_balance_updated"
      wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "wallet not found" # Only works in the mock atm
      $translate("WALLET_NOT_FOUND").then (translation) ->
        wallet.displayError(translation)
    else if event == "ticker_updated" || event == "did_set_latest_block"
      if wallet.status.isLoggedIn 
        wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else if event == "logging_out"
      if wallet.didLogoutByChoice == true
        $translate("LOGGED_OUT").then (translation) ->
          $cookieStore.put("alert-success", translation)
      else
        $translate("LOGGED_OUT_AUTOMATICALLY").then (translation) ->
          $cookieStore.put("alert-warning", translation)
          $rootScope.$apply()
        
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
    else
      console.log event
  # The new monitoring system  
  wallet.monitor = (event) ->
    if event.type == "error"
      wallet.displayError(event.message)
      console.log event
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
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
    

  ############
  # Settings #
  ############
  
  wallet.setLanguage = (language) ->
    $translate.use(language.code)
    wallet.settings.language = language
    
  wallet.changeLanguage = (language) ->
    wallet.my.change_language(language.code)
    wallet.setLanguage(language)
    
  wallet.languages = [
    {code: "de", name: "German"}
    {code: "hi", name: "Hindi"}
    {code: "no", name: "Norwegian"}
    {code: "ru", name: "Russian"}
    {code: "pt", name: "Portugese"}
    {code: "bg", name: "Bulgarian"}
    {code: "fr", name: "French"}
    {code: "zh-cn", name: "Chinese Simplified"}
    {code: "hu", name: "Hungarian"}
    {code: "sl", name: "Slovenian"}
    {code: "id", name: "Indonesian"}
    {code: "sv", name: "Swedish"}
    {code: "ko", name: "Korean"}
    {code: "el", name: "Greek"}
    {code: "en", name: "English"}
    {code: "it", name: "Italiano"}
    {code: "es", name: "Spanish"}
    {code: "vi", name: "Vietnamese"}
    {code: "th", name: "Thai"}
    {code: "ja", name: "Japanese"}
    {code: "pl", name: "Polski"}
    {code: "da", name: "Danish"}
    {code: "ro", name: "Romanian"}
    {code: "nl", name: "Dutch"}
    {code: "tr", name: "Turkish"}
  ]
  
  wallet.changeEmail = (email) ->
    wallet.my.changeEmail(email)
    wallet.user.email = wallet.my.getEmail()
    wallet.user.isEmailVerified = wallet.my.isEmailVerified
    
  wallet.isEmailVerified = () ->
    wallet.my.isEmailVerified
    
  wallet.changeMobile = (mobile) ->
    wallet.my.changeMobile(mobile)
    wallet.user.mobile = wallet.my.getMobile()
    wallet.user.isMobileVerified = wallet.my.isMobileVerified
    
  wallet.isMobileVerified = () ->
    wallet.my.isMobileVerified
  
  ########################################
  # Testing: only works on mock MyWallet #
  ########################################
  
  wallet.refresh = () ->
    wallet.my.refresh()
    wallet.updateAccounts()
    wallet.updateTransactions()
    
  wallet.isMock = wallet.my.mockShouldFailToSend != undefined
            
  return  wallet
