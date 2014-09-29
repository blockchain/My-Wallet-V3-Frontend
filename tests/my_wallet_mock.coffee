# Complete mock of MyWallet.

walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window) ->
    myWallet = {}

    myWallet.restoreWallet = (password) ->
      return
      
    myWallet.setGUID = (uid) ->
      return
      
    myWallet.getLanguage = () ->
      return "en"
      
    myWallet.getActiveAddresses = () ->
      return []
      
    # Pending refactoring of MyWallet:
    $window.symbol_local = {code: "USD",conversion: 250000.0, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
      
    return myWallet 