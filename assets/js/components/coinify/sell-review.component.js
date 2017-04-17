angular
  .module('walletApp')
  .component('sellReview', {
    bindings: {
      // transaction: '<',
      sellTrade: '<',
      // bankId: '<',
      dismiss: '&'
    },
    templateUrl: 'partials/coinify/sell-review.pug',
    controller: CoinifySellReviewController,
    controllerAs: '$ctrl'
  });

function CoinifySellReviewController () {
  console.log('sell review component', this);
  this.dateFormat = 'd MMMM yyyy, HH:mm';
  this.btcSold = this.sellTrade.sendAmount / 100000000;
  this.bank = this.sellTrade._bankAccountNumber;
  this.creditIssued = `${this.sellTrade.outAmountExpected / 100} ${this.sellTrade.outCurrency}`;
}
