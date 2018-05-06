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
        EUR: {'15m': 250, last: 250, buy: 250, sell: 250, symbol: '€'},
        USD: {'15m': 300, last: 300, buy: 300, sell: 300, symbol: '$'},
        INR: {'15m': 0, last: 0, buy: 0, sell: 0, symbol: 'INR'}
      };
      return $q.resolve(result);
    },
    getFiatAtTime (time, amount, currency) {
      return $q.resolve(amount.toFixed(2));
    },
    createExperiment () {
      return { recordA: () => {}, recordB: () => {} };
    },
    incrementBuyLimitCounter () {
      return true;
    }
  }));
