walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout, $log) ->
    myWallet = {}
    accounts = []
    accountsOnServer = [
      {label: "Savings", archived: false, balance: 300000000 - 25000000, receive_addresses: []},
      {label: "Mobile", archived: false, balance: 25000000 - 1500000, receive_addresses: ["13QsKpDMchnssikZEaJKdkTX7pycFEcTi1"]}
    ]
    transactions = []
    transactionsOnServer = [
      {hash: "aaaa", amount: 300000000, confirmations: 13, doubleSpend: false, coinbase: false, intraWallet: false, from_account: null, from_address: "1D2YzLr5qvrwMSm8onYbns5BLJ9jwzPHcQ", to_account: 0, note: "Salary", txTime: 1331300839},
      {hash: "aaab", amount: -25000000, confirmations: 3, doubleSpend: false, coinbase: false, intraWallet: true, from_account: 0, from_address: null, to_account: 1, to_address: null, note: null, txTime:   2000000000},
      {hash: "afsdfsdkj", amount: -1500000, confirmations: 1, doubleSpend: false, coinbase: false, intraWallet: false, from_account: 1, from_address: null, to_account: null, to_address: "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq" ,note: null, txTime:   8200000000},
    ]
    monitorFunc = undefined  # New system
    eventListener = undefined # Old system
    
    mockRules = {shouldFailToSend: false}
    
    myWallet.addressBook = {
      "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq": "John"
      "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq": "Alice"
    }

    paymentRequests = []
    
    mockPaymentRequestAddressStack = [
      "1ggDhwUX5LRsJHeeEYn8MEimBKNco2Ywq"
      "1Gyz5MPYY1ZKLcvmXSPHMAi1xpHbdCGaUN"
      "1M4YSYCarkSeNUk9D1o3F7hHFL9c2EYums"
      "1LKwobBwhVwq4HF7NqBeebVg4UTLgS3bc5"
      "1MgYrhUtb5RfV5DTaWiLGTbSMVKuFNVC7Y"
      "1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp"
    ]

    myWallet.restoreWallet = (password) ->
      this.refresh()
      return
      
    myWallet.setGUID = (uid) ->
      return
      
    myWallet.getLanguage = () ->
      return "en"
      
    myWallet.getAccounts = () ->
      return accounts
      
    myWallet.generateAccount = () ->
      accounts.push {label: "Account #" + (accounts.length + 1), archived: false, balance: 0, receive_addresses: [] }
      
    myWallet.getTransactions = () ->
      return transactions
      
    # Amount in Satoshi
    myWallet.makeTransaction = (fromAccountIndex,toAddress, amount, listener) ->
      if mockRules.shouldFailToSend
        listener.on_error({message: "Reason for failure"})
        return
        
      # A few sanity checks (not complete)
      if amount > accounts[fromAccountIndex].balance
        listener.on_error({message: "Insufficient funds"})
        return
      
      listener.on_start()
      listener.on_begin_signing()
      listener.on_sign_progress()
      listener.on_finish_signing()
      listener.on_before_send()
      
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
      accountsOnServer[fromAccountIndex].balance -= amount
      transactionsOnServer.push transaction
      
      listener.on_success()
      
      return
      
    # Amount in Satoshi  
    myWallet.generatePaymentRequestForAccount = (account, amount) ->
      # It should generate a new receive address or reuse a cancelled address
      # (never reuse an addres that actually received btc). It should increase
      # the tally in the wallet.
      
      if mockPaymentRequestAddressStack.length == 0
        $log.error "No more mock payment request addresses; please refresh."
        return {amount: 0, address: "No more mock addresses available"}
        
      address = mockPaymentRequestAddressStack.pop()
      
      request = {address: address, amount: amount, account: account, paid: 0, complete: false}
      
      accounts[account].receive_addresses.push address
      
      paymentRequests.push request
      return request # This mock method only works once.
      
    myWallet.cancelPaymentRequest = (accountIndex, address) ->
      for candidate in paymentRequests
        if candidate.address == address
          paymentRequests.pop(candidate)
          mockPaymentRequestAddressStack.push(address)
          
      return
      
    # Gets payment requests for all accounts:
    myWallet.getPaymentRequests = () ->
      return paymentRequests
      
    myWallet.updatePaymentRequest = (account, address, amount) ->
      for candidate in paymentRequests
        if candidate.address == address
          candidate.amount = amount
          return candidate
      
    myWallet.addEventListener = (func) ->
      eventListener = func
      
    myWallet.monitor = (func) ->
      monitorFunc = func
      
    # Pending refactoring of MyWallet:
    $window.symbol_local = {code: "USD",conversion: 250000.0, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
      
    ############################################################
    # Simulate spontanuous behavior when using mock in browser #
    ############################################################
    myWallet.mockSpontanuousBehavior = () ->
      $timeout((->
        myWallet.mockShouldReceiveNewTransaction()
        ), 5000)
      
    ###################################
    # Fake methods useful for testing #
    ###################################
    
    myWallet.refresh = () ->
      angular.copy(accountsOnServer, accounts)
      angular.copy(transactionsOnServer, transactions)
      
      
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
          request.paid += transaction.amount # The real thing should use the amount per output
          
          request.complete = request.paid == transaction.amount 
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
            
            break

    myWallet.mockShouldReceiveNewBlock = () ->
      eventListener("on_block")
    
    return myWallet 