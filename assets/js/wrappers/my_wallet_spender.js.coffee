walletSpenderServices = angular.module("myWalletSpenderServices", [])
walletSpenderServices.factory "MyWalletSpender", () ->
  Blockchain.Spender