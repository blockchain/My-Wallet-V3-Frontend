angular
  .module('walletApp')
  .component('sellSummary', {
    bindings: {
      transaction: '<',
      fields: '<',
      sellTrade: '<',
      totalBalance: '<',
      error: '<',
      waiting: '<',
      onComplete: '&',
      sell: '&',
      close: '&',
      dismiss: '&'
    },
    templateUrl: 'partials/coinify/sell-summary.pug',
    controller: CoinifySellSummaryController,
    controllerAs: '$ctrl'
  });

function CoinifySellSummaryController ($scope) {
  this.sellRateForm;

  this.insufficientFunds = () => {
    const tx = this.transaction;
    const combined = tx.btc + tx.fee.btc;
    if (combined > this.totalBalance) {
      return true;
    }
  };

  this.isDisabled = () => {
    if (!this.fields) true;
    if (this.insufficientFunds() === true || !this.sellRateForm.$valid) return true;
    if (this.sellTrade) {
      if (!this.sellTrade.quote) true;
    }
  };

  this.status = {};
}
