walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout, $log, localStorageService) ->
  # Erase local storage:
  localStorageService.remove("mockWallets")
  
  # Wallets are stored in a cookie. If there isn't one, we'll create it.
  unless localStorageService.get("mockWallets") 
    localStorageService.set("mockWallets", {
      "test": {
        password: "test"
        accounts: [
          {label: "Savings", archived: false, balance: 300000000 - 25000000, receive_addresses: []},
          {label: "Mobile", archived: false, balance: 25000000 - 1500000, receive_addresses: ["13QsKpDMchnssikZEaJKdkTX7pycFEcTi1"]}
        ]
        transactions: [
          {hash: "aaaa", amount: 300000000, confirmations: 13, doubleSpend: false, coinbase: false, intraWallet: false, from_account: null, from_address: "1D2YzLr5qvrwMSm8onYbns5BLJ9jwzPHcQ", to_account: 0, note: "Salary", txTime: 1331300839},
          {hash: "aaab", amount: -25000000, confirmations: 3, doubleSpend: false, coinbase: false, intraWallet: true, from_account: 0, from_address: null, to_account: 1, to_address: null, note: null, txTime:   2000000000},
          {hash: "afsdfsdkj", amount: -1500000, confirmations: 1, doubleSpend: false, coinbase: false, intraWallet: false, from_account: 1, from_address: null, to_account: null, to_address: "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq" ,note: null, txTime:   8200000000},
        ]
      }
    })
        
  uid = undefined
  
  isSynchronizedWithServer = true # In the sense that the server is up to date
  
  myWallet = {}
  accounts = []

  transactions = []

  monitorFunc = undefined  # New system
  eventListener = undefined # Old system
  
  mockRules = {shouldFailToSend: false}
  
  myWallet.addressBook = { # The same for everyone
    "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq": "John"
    "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq": "Alice"
  }

  paymentRequests = []
  
  mockPaymentRequestAddressStack = [ # Same for everyone
    "1ggDhwUX5LRsJHeeEYn8MEimBKNco2Ywq"
    "1Gyz5MPYY1ZKLcvmXSPHMAi1xpHbdCGaUN"
    "1M4YSYCarkSeNUk9D1o3F7hHFL9c2EYums"
    "1LKwobBwhVwq4HF7NqBeebVg4UTLgS3bc5"
    "1MgYrhUtb5RfV5DTaWiLGTbSMVKuFNVC7Y"
    "1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp"
  ]
  
  myWallet.getHDWallet = () ->
    myWallet

  myWallet.restoreWallet = (password) ->
    unless password && password == localStorageService.get("mockWallets")[myWallet.uid].password
      monitorFunc({type: "error", message: "Wrong password", code: 0});
      return
      
    this.refresh()
    
    eventListener("did_decrypt")
    eventListener("did_multiaddr")
    return
    
  myWallet.setGUID = (uid) ->
    if localStorageService.get("mockWallets")[uid]
      myWallet.uid = uid
      eventListener("did_set_guid")
    else
      $log.error "Wallet not found"
      eventListener("wallet not found")
      
  myWallet.register = (uid, pwd, success, fail) ->
    wallets = localStorageService.get("mockWallets")
    if wallets[uid]
      fail({message: "Wallet already exists"})
    else
      wallets[uid] = {
        password: pwd
        accounts: [
          {label: "Spending", archived: false, balance: 0, receive_addresses: []}
        ]
        transactions: []
      }
      localStorageService.set("mockWallets", wallets)
      success()
  
  myWallet.logout = () ->
    myWallet.uid = undefined
    myWallet.password = undefined
    transactions = []
    paymentRequests = []
    accounts = []
      
  myWallet.get_ticker = (success, fail) ->
    success()
    
  myWallet.getAccounts = () ->    
    return accounts
    
  myWallet.getAccountsCount = () ->
    return accounts.length
    
  myWallet.getLabelForAccount = (idx) ->
    return accounts[idx].label
    
  myWallet.getBalanceForAccount = (idx) ->
    return accounts[idx].balance
    
  myWallet.createAccount = (label) ->
    accounts.push {label: label, archived: false, balance: 0, receive_addresses: [] }
    myWallet.sync()
    
  myWallet.getTransactionsForAccount = (idx) ->
    res = []
    for transaction in transactions
      if transaction.to_account == idx || transaction.from_account == idx
        res.push transaction
    
    return res
    
  # Amount in Satoshi
  myWallet.sendBitcoinsForAccount = (fromAccountIndex,toAddress, amount, fee, note, success, error) ->
    if mockRules.shouldFailToSend
      error({message: "Reason for failure"})
      return
      
    # A few sanity checks (not complete)
    if amount > accounts[fromAccountIndex].balance
      error({message: "Insufficient funds"})
      return
    
    ###
    The MyWallet mock parses transactions by just copying them, so the following 
    transaction is what a real transaction would look like  *after* processing. 
    
    The real transaction may have several inputs (from receiving and change address 
    for this account). A new change address may need to be generated.
    
    Transaction parsing should be able to figure out which account was the sender and 
    change address and which address represents a recipient.
    ###
    transaction  = {hash: "hash-" + (new Date()).getTime(), amount: amount, confirmations: 0, doubleSpend: false, coinbase: false, intraWallet: false, from_account: fromAccountIndex, from_address: null, to_account: null, to_address: toAddress, note: null, txTime: (new Date()).getTime()}

    # MyWallet stores transaction locally (so it already knows it by the time
    # it receives the websocket notification).

    transactions.push transaction
    accounts[fromAccountIndex].balance -= amount
    
    # Blockchain.info will know about these transactions:
    cookie = localStorageService.get("mockWallets")
    cookie[this.uid].accounts[fromAccountIndex].balance -= amount
    cookie[this.uid].transactions.push transaction
    localStorageService.set("mockWallets", cookie)
    
    success()
    
    return
    
  # Amount in Satoshi  
  myWallet.getAccount = (index) ->
    if index < 0
      return
      
    account = {}
    
    account.getPaymentRequests = () ->
      requests = []
      for request in paymentRequests
        requests.push request if request.account == index
        
      return requests 
    
    account.generatePaymentRequest = (amount) ->
      # It should generate a new receive address or reuse a cancelled address
      # (never reuse an addres that actually received btc). It should increase
      # the tally in the wallet.
    
      if mockPaymentRequestAddressStack.length == 0
        $log.error "No more mock payment request addresses; please refresh."
        return {amount: 0, address: "No more mock addresses available"}
      
      address = mockPaymentRequestAddressStack.pop()
    
      request = {address: address, amount: amount, account: index, paid: 0, complete: false, canceled: false}

      accounts[index].receive_addresses.push address
    
      paymentRequests.push request
      
      myWallet.sync()
      
      return request
      
    account.cancelPaymentRequest = (address) ->
      for candidate in paymentRequests
        if candidate.address == address
          paymentRequests.pop(candidate)
          mockPaymentRequestAddressStack.push(address)
          myWallet.sync()
          return true
        
      return false
    
    account.updatePaymentRequest = (address, amount) ->
      for candidate in paymentRequests
        if candidate.address == address
          candidate.amount = amount
          myWallet.sync()
          return candidate
        
    account.acceptPaymentRequest = (address) ->
      for candidate in paymentRequests
        if candidate.address == address
          myWallet.sync()
          candidate.complete = true
    
    return account
  
  myWallet.getPaymentRequestsForAccount = (idx) ->
    myWallet.getAccount(idx).getPaymentRequests()
  
  myWallet.generatePaymentRequestForAccount = (idx, amount) ->
    myWallet.getAccount(idx).generatePaymentRequest(amount)

  myWallet.cancelPaymentRequestForAccount = (idx, address) ->
    myWallet.getAccount(idx).cancelPaymentRequest(address)
    
  myWallet.updatePaymentRequestForAccount = (idx, address, amount) ->
    myWallet.getAccount(idx).updatePaymentRequest(address, amount)
    
  myWallet.acceptPaymentRequestForAccount = (idx, address) ->
    myWallet.getAccount(idx).acceptPaymentRequest(address)
    
  myWallet.addEventListener = (func) ->
    eventListener = func
    
  myWallet.monitor = (func) ->
    monitorFunc = func
    
  # Pending refactoring of MyWallet:
  $window.symbol_local = {code: "USD",conversion: 250000.0, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
    
  myWallet.isSynchronizedWithServer = () ->
    return isSynchronizedWithServer
    
  myWallet.recommendedTransactionFeeForAccount = () ->
    return 0.0001
    
  ############################################################
  # Simulate spontanuous behavior when using mock in browser #
  ############################################################

    
  ###################################
  # Fake methods useful for testing #
  ###################################
  
  myWallet.sync = () ->
    isSynchronizedWithServer = false
    
    if myWallet.pendingSync != undefined
      $timeout.cancel(myWallet.pendingSync)
      
    myWallet.pendingSync = $timeout((->
      # Save payment requests and accounts in our cookie:
      cookie = localStorageService.get("mockWallets")
      unless cookie[myWallet.uid]
        console.log "User " + myWallet.uid + " not found in local storage."
        console.log localStorageService.get("mockWallets")
        return 
        
      cookie[myWallet.uid].paymentRequests = paymentRequests
      cookie[myWallet.uid].accounts = accounts
      localStorageService.set("mockWallets", cookie)
      isSynchronizedWithServer = true
    ), 5000)
    
  
  myWallet.refresh = () ->
    accounts = angular.copy(localStorageService.get("mockWallets")[this.uid].accounts)
    transactions = angular.copy(localStorageService.get("mockWallets")[this.uid].transactions)
    if localStorageService.get("mockWallets")[this.uid].paymentRequests
      paymentRequests = angular.copy(localStorageService.get("mockWallets")[this.uid].paymentRequests)      
      # Update the stack of remaning payment addresses:
      for request in paymentRequests 
        index = mockPaymentRequestAddressStack.indexOf(request.address)
        if index > -1
          mockPaymentRequestAddressStack.splice(index,1)
        
  #####################################
  # Tell the mock to behave different # 
  #####################################
  myWallet.mockShouldFailToSend = () ->
    mockRules.shouldFailToSend = true
    
  myWallet.mockShouldReceiveNewTransaction = (address="13QsKpDMchnssikZEaJKdkTX7pycFEcTi1", from="17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq", amount=400000, note="Thanks for the tea") ->
    this.mockProcessNewTransaction {hash: "mock-receive-" + (new Date()).getTime(), amount: amount, confirmations: 0, doubleSpend: false, coinbase: false, intraWallet: false, from_account: null, from_address: from, to: address , note: note, txTime: (new Date()).getTime()}
    
    eventListener("on_tx")
    
  myWallet.mockProcessNewTransaction = (transaction) ->      
    # Does the "to" address match any payment requests? If so, update them with the amount:
    for request in paymentRequests
      if request.address == transaction.to
        request.paid += parseInt(transaction.amount) # The real thing should use the amount per output
                
        if request.paid == request.amount
          request.complete = true
          eventListener("hw_wallet_accepted_payment_request", {amount: request.amount})
          myWallet.sync()
        else if request.paid > 0 && request.amount > request.paid
          eventListener("hw_wallet_payment_request_received_too_little", {amountRequested: request.amount, amountReceived: request.paid})
        else if request.amount < request.paid
          eventListener("hw_wallet_payment_request_received_too_much", {amountRequested: request.amount, amountReceived: request.paid})

        break
    
    
    # Match "to" address to receive address to figure out which account it was sent to:
    for account in accounts
      for address in account.receive_addresses
        if address == transaction.to
          index = accounts.indexOf(account)
          transaction.to_account = index
          transaction.to_address = null
          transaction.to = undefined
          accounts[index].balance += transaction.amount
          
          transactions.push transaction
          
          # Update the "blockchain" in our cookie:
          cookie = localStorageService.get("mockWallets")
          cookie[this.uid].accounts[index].balance += transaction.amount
          cookie[this.uid].transactions.push transaction
          localStorageService.set("mockWallets", cookie)
          
          break

  myWallet.mockShouldReceiveNewBlock = () ->
    eventListener("on_block")
  
  return myWallet 