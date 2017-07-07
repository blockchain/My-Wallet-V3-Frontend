angular
  .module('walletApp.core')
  .factory('MyWallet', ($window, $timeout, $log, MyWalletStore) => ({
    wallet: {
      eth: {
        balance: 0
      }
    }
  }));
