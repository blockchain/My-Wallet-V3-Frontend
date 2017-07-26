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
    getExchangeRate (curr) {
      let result = {
        EUR: {'15m': 2094.5, last: 2094.5, buy: 2094.5, sell: 2092.79, symbol: '€'},
        USD: {'15m': 2436.99, last: 2436.99, buy: 2436.99, sell: 2435, symbol: '$'}
      };
      return $q.resolve(result);
    },
    getFiatAtTime (time, amount, currency) {
      return $q.resolve(amount.toFixed(2));
    }
  }));
