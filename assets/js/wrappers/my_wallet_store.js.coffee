walletStoreServices = angular.module("myWalletStoreServices", [])
walletStoreServices.factory "MyWalletStore", () ->
  Blockchain.WalletStore