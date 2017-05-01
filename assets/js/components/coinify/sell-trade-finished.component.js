angular
  .module('walletApp')
  .component('sellTradeFinished', {
    bindings: {
      sellTrade: '<',
      completedState: '<',
      dismiss: '&'
    },
    templateUrl: 'partials/coinify/sell-trade-finished.pug',
    controller: CoinifySellTradeFinishedController,
    controllerAs: '$ctrl'
  });

function CoinifySellTradeFinishedController (currency) {
  console.log('trade-finished', this)
  this.dateFormat = 'd MMMM yyyy, HH:mm';

  if (this.completedState) {
    this.isx = true;
    this.title = 'SELL.IDENTITY_VERIFICATION';
    this.completedState = `SELL.ISX.${this.completedState.toUpperCase()}`;
  } else {
    if (this.sellTrade.state === 'completed' ||
        this.sellTrade.state === 'expired' ||
        this.sellTrade.state === 'cancelled' ||
        this.sellTrade.state === 'rejected') {
      this.tradeCompleted = true;
    } else {
      this.tradeCompleted = false;
    }
    this.title = 'SELL.SELL_BITCOIN';
    this.id = this.sellTrade.id;
    this.btcSold = currency.convertFromSatoshi(this.sellTrade.sendAmount, currency.bitCurrencies[0]);
    this.bank = this.sellTrade._bankAccountNumber;
    this.creditIssued = `${this.sellTrade.outAmountExpected / 100} ${this.sellTrade.outCurrency}`;
    this.showNote = () => this.sellTrade.state === 'completed' || this.sellTrade.state === 'awaiting_transfer_in';
  }
}
