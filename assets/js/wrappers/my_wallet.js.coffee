walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", () ->
    return Blockchain.MyWallet