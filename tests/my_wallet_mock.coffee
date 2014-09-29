# MyWallet mock

walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window) ->
    myWallet = {}
    addresses = []
    transactions = []

    myWallet.restoreWallet = (password) ->
      return
      
    myWallet.setGUID = (uid) ->
      return
      
    myWallet.getLanguage = () ->
      return "en"
      
    myWallet.getActiveAddresses = () ->
      return addresses
      
    myWallet.getAddressLabel = () ->
      return addresses[0]
      
    myWallet.generateNewKey = () ->
      addresses.push {label: "some new address", address: "abcd"}
      
    myWallet.getTransactions = () ->
      return transactions
      
    # Pending refactoring of MyWallet:
    $window.symbol_local = {code: "USD",conversion: 250000.0, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
      
    return myWallet 