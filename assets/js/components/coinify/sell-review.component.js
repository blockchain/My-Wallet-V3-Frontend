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

function CoinifySellReviewController (currency) {
  console.log('sell review component', this);
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
    this.sellTrade.createdAt = this.completedTrade.createdAt;
    this.btcSold = currency.convertFromSatoshi(this.completedTrade.inAmount, currency.bitCurrencies[0]);
    this.bank = this.completedTrade._bankAccountNumber;
    this.creditIssued = (this.completedTrade.outAmountExpected / 100) + ' ' + this.completedTrade.outCurrency;
  } else {
    this.id = this.sellTrade.id;
    this.btcSold = currency.convertFromSatoshi(this.sellTrade.sendAmount, currency.bitCurrencies[0]);
    this.bank = this.sellTrade._bankAccountNumber;
    this.creditIssued = `${this.sellTrade.outAmountExpected / 100} ${this.sellTrade.outCurrency}`;
    this.tradeCompleted = determineTradeState(this.sellTrade._state);
  }
}
