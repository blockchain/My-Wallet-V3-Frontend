angular
  .module('walletApp')
  .component('coinifyRecurringConfirm', {
    bindings: {
      frequency: '<',
      endTime: '<',
      onCancel: '&',
      onProceed: '&'
    },
    templateUrl: 'partials/coinify/recurring-confirm.pug',
    controller: CoinifyRecurringConfirmController,
    controllerAs: '$ctrl'
  });

function CoinifyRecurringConfirmController (recurringTrade) {
  this.date = new Date()
  this.recurringTiming = () => recurringTrade.getTimespan(this.date, this.frequency);
}
