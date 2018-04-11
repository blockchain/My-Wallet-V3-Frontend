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
  this.needsMoreTradesForRecurring = coinify.needsMoreTradesForRecurring;

  const determineState = () => {
    if (this.needsKyc && this.needsMoreTradesForRecurring) return 'NEEDS_KYC_AND_TRADES';
    if (this.needsKyc) return 'NEEDS_KYC';
    if (this.needsMoreTradesForRecurring) return 'NEEDS_TRADES';
    return 'PROCEED';
  };
  this.state = determineState();
}
