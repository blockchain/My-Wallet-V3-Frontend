walletStoreServices = angular.module("myWalletStoreServices", [])
walletStoreServices.factory "MyWalletStore", () ->
    return WalletStore