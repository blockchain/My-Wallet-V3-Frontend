angular
  .module('walletApp')
  .component('coinifyRecurringConfirm', {
    bindings: {
      frequency: '<',
      endTime: '<',
      exchange: '<',
      needsKyc: '<',
      onCancel: '&',
      onProceed: '&'
    },
    templateUrl: 'partials/coinify/recurring-confirm.pug',
    controller: CoinifyRecurringConfirmController,
    controllerAs: '$ctrl'
  });

function CoinifyRecurringConfirmController (recurringTrade, coinify) {
  this.date = new Date();
  this.recurringTiming = () => recurringTrade.getTimespan(this.date, this.frequency);
  this.needsMoreTrades = coinify.trades.filter((t) => coinify.tradeStateIn(coinify.states.completed)(t) && !t.tradeSubscriptionId && t.medium === 'card').length < 3;

  const determineState = () => {
    if (this.needsKyc && this.needsMoreTrades) return 'NEEDS_KYC_AND_TRADES';
    if (this.needsKyc) return 'NEEDS_KYC';
    if (this.needsMoreTrades) return 'NEEDS_TRADES';
    return 'PROCEED';
  };
  this.state = determineState();
}
