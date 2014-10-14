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
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet, $rootScope, ngAudio) ->
  wallet = {status: {isLoggedIn: false}, totals: {}, settings: {currency: {conversion: 0}}}
  
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
      wallet.alerts.push({type: "success", msg: "Wallet created"})
      wallet.login(uid, password)
    
    error = (error) ->
      wallet.alerts.push({type: "danger", msg: error.message})
      
    wallet.my.register(uid, password, success, error)
        
  wallet.createAccount = () ->
    wallet.my.createAccount( "Account #" + (wallet.accounts.length + 1))
    wallet.transactions.push []
    wallet.updateAccounts()
    
  wallet.logout = () ->
    wallet.my.logout()
    wallet.status.isLoggedIn = false
    while wallet.accounts.length > 0
      wallet.accounts.pop()
    while wallet.transactions.length > 0
      wallet.transactions.pop()
    while wallet.paymentRequests.length > 0
      wallet.paymentRequests.pop()
    wallet.uid = ""
    wallet.password = ""    
  
  ####################
  #   Transactions   #
  ####################
  
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
    
    wallet.my.sendBitcoinsForAccount(fromAccountIndex, to, amount * 100000000, 10000, success, error)
      
  ####################
  # Payment requests #
  ####################
  
  wallet.accountForPaymentRequest = (request) ->
    for i in [0..wallet.my.getAccountsCount()-1]
      for req in wallet.my.getPaymentRequestsForAccount(i)
        return wallet.accounts[i] if request.address = req.address
      
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
          break
      
      if !match
        request = {}
        angular.copy(req, request)
        request.account = 0 # TODO: match the correct account
        wallet.paymentRequests.push request
            
  # Amount in Satoshi
  wallet.generatePaymentRequestForAccount = (accountIndex, amount)  ->
    request = wallet.my.generatePaymentRequestForAccount(accountIndex, amount)
    this.refreshPaymentRequests()
    return request
  
  wallet.cancelPaymentRequest = (accountIndex, address)  ->
    wallet.my.cancelPaymentRequestForAccount(accountIndex, address)
    this.refreshPaymentRequests()
    return
      
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
             result.amount = parseFloat(value)
             result.currency = "BTC"
           else
             $log.info "Ignoring argument " + argument + " in: " + url
             loopCount++

           argumentList = argumentList.replace(argument + "=" + value + "&", "")

       else
         result.address = withoutPrefix
    
    return result
  
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
      wallet.accounts[i].balance = wallet.my.getBalanceForAccount(i)
      
    # Balances will be 0 until transactions have been loaded.
    # TODO: MyWallet should let us know when all transactions are loaded; hide
    # total until that time.
    
    tally = 0.0
    for account in wallet.accounts
      tally = tally + account.balance
    
    wallet.totals.btc = tally
    wallet.totals.fiat  = tally / wallet.settings.currency.conversion
    
  wallet.updateTransactions = () ->
    for i in [0..wallet.my.getAccountsCount()-1]
      for tx in wallet.my.getTransactionsForAccount(i)
        match = false
        for candidate in wallet.transactions
          if candidate.hash == tx.hash
            candidate.fiat = candidate.amount / wallet.settings.currency.conversion
            match = true
            break
      
        if !match
          transaction = {}
          angular.copy(tx, transaction)
          unless wallet.settings.currency == undefined
            transaction.fiat = transaction.amount / wallet.settings.currency.conversion
          wallet.transactions.push transaction 
      
  ####################
  # Notification     #
  ####################
            
  # The old monitoring system
  wallet.monitorLegacy = (event) ->
    # console.logaccountsd: " + event
    if event == "on_tx" or event == "on_block"
      before = wallet.transactions.length
      wallet.updateTransactions()
      if wallet.transactions.length > before
        sound = ngAudio.load("beep.wav")
        sound.play()
        wallet.updateAccounts()
        wallet.updateTransactions()
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
  
      # Checks if we already have an HD wallet. If not, create one.
      hdwallet = MyWallet.getHDWallet()
      
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    # else if event == "on_wallet_decrypt_finish"
    else if event == "did_decrypt"   # Wallet decrypted succesfully  
      wallet.status.isLoggedIn = true 
      wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
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
      wallet.alerts.push({type: "danger", msg: "Wallet not found"})
    else if event == "ticker_updated" || event == "did_set_latest_block"
      if wallet.status.isLoggedIn 
        wallet.updateAccounts()  
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else
      console.log event
  # The new monitoring system  
  wallet.monitor = (event) ->
    if event.type == "error"
      wallet.alerts.push({type: "danger", msg: event.message})
      if MyWallet.mockShouldReceiveNewTransaction == undefined
        $rootScope.$apply()
    else 
      console.log event

  wallet.my.monitor((event) -> wallet.monitor(event))
  wallet.my.addEventListener((event) -> wallet.monitorLegacy(event))

  ########################################
  # Testing: only works on mock MyWallet #
  ########################################
  
  wallet.refresh = () ->
    wallet.my.refresh()
    wallet.updateAccounts()
    wallet.updateTransactions()
            
  return  wallet
