angular
  .module('walletApp.core')
  .factory('MyBlockchainApi', $q => ({
    getTicker () {
      let result = {
        EUR: {'last': 250, symbol: '€'},
        USD: {'last': 300, symbol: '$'}
      };
      return $q.resolve(result);
    },
    getFiatAtTime (time, amount, currency) {
      return $q.resolve(amount.toFixed(2));
    }
  }));
