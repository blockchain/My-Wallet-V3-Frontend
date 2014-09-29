# Complete mock of MyWallet.

walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", () ->
    myWallet = {}

    myWallet.restoreWallet = (password) ->
      return
      
    myWallet.setGUID = (uid) ->
      return
      
    myWallet.getLanguage = () ->
      return
      
    myWallet.getActiveAddresses = () ->
      return []
      
    return myWallet 