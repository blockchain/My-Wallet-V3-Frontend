angular
  .module('walletApp.core')
  .factory('MyWallet', ($window, $timeout, $log, MyWalletStore) => ({
    wallet: {
      accountInfo: {
        countryCodeGuess: 'US'
      },
      eth: {
        balance: 0
      }
    }
  }));
