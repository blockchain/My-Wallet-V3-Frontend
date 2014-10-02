# MyWallet mock

walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window) ->
    myWallet = {}
    addresses = []
    addressesOnServer = [{label: "Savings", address: "abcdefghijk", balance: 2.0}]
    transactions = []
    
    mockRules = {shouldFailToSend: false}

    myWallet.restoreWallet = (password) ->
      this.refresh()
      return
      
    myWallet.setGUID = (uid) ->
      return
      
    myWallet.getLanguage = () ->
      return "en"
      
    myWallet.getActiveAddresses = () ->
      return addresses
      
    myWallet.getAddressLabel = () ->
      # TODO: fetch correct addresss
      return addresses[0] 
      
    myWallet.getAddressBalance = (address) ->
      # TODO: fetch correct addresss
      return addresses[0].balance
      
    myWallet.generateNewKey = () ->
      addresses.push {label: "some new address", address: "abcd", balance: 0.9}
      
    myWallet.getTransactions = () ->
      return transactions
      
    myWallet.quickSendNoUI = (to, value, listener) ->
      if mockRules.shouldFailToSend
        listener.on_error()
        return
      
      listener.on_start()
      listener.on_begin_signing()
      listener.on_sign_progress()
      listener.on_finish_signing()
      listener.on_before_send()
      
      addressesOnServer[0].balance = addressesOnServer[0].balance - value
      
      listener.on_success()
      
      return
      
    # Pending refactoring of MyWallet:
    $window.symbol_local = {code: "USD",conversion: 250000.0, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
      
    ###################################
    # Fake methods useful for testing #
    ###################################
    
    myWallet.refresh = () ->
      angular.copy(addressesOnServer, addresses)
      
    #####################################
    # Tell the mock to behave different # 
    #####################################
    myWallet.mockShouldFailToSend = () ->
      mockRules.shouldFailToSend = true
      return
    
    return myWallet 