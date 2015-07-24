walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout, $log, localStorageService, $cookieStore, MyWalletStore) ->
  return {}
            