walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout) ->
    myWallet = {}
    accounts = []
    accountsOnServer = [
      {label: "Savings", archived: false, balance: 300000000 - 25000000},
      {label: "Mobile", archived: false, balance: 25000000 - 1500000}
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
      accounts.push {label: "Account #" + (accounts.length + 1), archived: false, balance: 0}
      
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
      
    myWallet.mockShouldReceiveNewTransaction = () ->
      transactions.push {hash: "aaac", amount: 400000, confirmations: 0, doubleSpend: false, coinbase: false, intraWallet: false, from_account: null, from_address: "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq", to_account: 1, note: "Thanks for the tea", txTime: 21331300839}
      accounts[1].balance += 400000

      eventListener("on_tx")
      
    myWallet.mockShouldReceiveNewBlock = () ->
      eventListener("on_block")
    
    return myWallet 