angular
  .module('walletApp.core')
  .factory 'MyWallet', ($window, $timeout, $log, localStorageService, $cookieStore, MyWalletStore) ->
    return {}
