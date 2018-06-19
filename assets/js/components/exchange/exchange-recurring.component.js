angular
  .module('walletApp')
  .component('exchangeRecurring', {
    bindings: {
      trade: '<t',
      dollars: '<',
      endTime: '<',
      frequency: '<',
      showRemove: '<',
      paymentFee: '<',
      onRemove: '&',
      onClose: '&'
    },
    templateUrl: 'templates/exchange/recurring.pug',
    controller: ExchangeRecurringController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringController ($scope, currency, recurringTrade) {
  let frequency = this.frequency;

  $scope.date = new Date();
  $scope.format = currency.formatCurrencyForView;

  this.trade.fiatAmount = this.trade.fiatAmount || this.trade.inAmount / 100;

  $scope.endTime = this.endTime && new Date(this.endTime).toDateString();
  $scope.timespan = recurringTrade.getTimespan($scope.date, frequency);
  $scope.paymentFee = this.paymentFee || parseFloat((this.trade.sendAmount / 100).toFixed(2)) - this.trade.fiatAmount;
}
