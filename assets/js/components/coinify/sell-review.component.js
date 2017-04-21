angular
  .module('walletApp')
  .component('sellReview', {
    bindings: {
      sellTrade: '<',
      completedTrade: '<',
      dismiss: '&'
    },
    templateUrl: 'partials/coinify/sell-review.pug',
    controller: CoinifySellReviewController,
    controllerAs: '$ctrl'
  });

function CoinifySellReviewController () {
  this.dateFormat = 'd MMMM yyyy, HH:mm';
  const determineTradeState = (state) => {
    switch (state) {
      case 'completed':
        true;
        break;
      case 'expired':
        true;
        break;
      case 'cancelled':
        true;
        break;
      case 'rejected':
        true;
        break;
      default:
        false;
        break;
    }
  };

  if (!this.sellTrade._state) {
    this.id = this.completedTrade.id;
    this.sellTrade.createdAt = this.completedTrade.createTime;
    this.btcSold = this.completedTrade.inAmount;
    this.bank = this.completedTrade.transferOut.details.account.number;
    this.creditIssued = this.completedTrade.outAmountExpected + ' ' + this.completedTrade.outCurrency;
  } else {
    this.id = this.sellTrade.id;
    this.btcSold = this.sellTrade.sendAmount / 100000000;
    this.bank = this.sellTrade._bankAccountNumber;
    this.creditIssued = `${this.sellTrade.outAmountExpected / 100} ${this.sellTrade.outCurrency}`;
    this.tradeCompleted = determineTradeState(this.sellTrade._state);
  }
  console.log('sell review component', this);
}
