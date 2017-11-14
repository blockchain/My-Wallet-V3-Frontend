angular
  .module('walletApp')
  .component('exchangeRecurringTrades', {
    bindings: {
      subscription: '<',
      buy: '<',
      trades: '&',
      cancelSubscription: '&'
    },
    templateUrl: 'templates/exchange/recurring-trades.pug',
    controller: ExchangeRecurringTradesController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringTradesController ($scope, coinify, $rootScope, Alerts) {
  $scope.state = {};
  $scope.subscription = this.subscription;
  $scope.trades = this.trades()().filter((t) => t.tradeSubscriptionId === $scope.subscription.id);
  $scope.recurringDateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy';
  $scope.dateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy, HH:mm';

  $scope.buyHandler = (trade) => {
    let { frequency, endTime } = this.subscription;
    this.buy(null, trade, frequency, endTime);
  };

  $scope.getClass = (trade) => {
    let c = '';

    if (coinify.tradeStateIn(coinify.states.error)(trade)) c = 'state-danger-text';
    else if (coinify.tradeStateIn(coinify.states.pending)(trade)) c = 'transfer';
    else if (coinify.tradeStateIn(coinify.states.success)(trade)) c = 'success';
    else c = '';

    return c;
  };

  $scope.cancel = () => {
    const onCancel = (res) => $scope.subscription.isActive = res.isActive;
    Alerts.confirm('CONFIRM_CANCEL_RECURRING_TRADE', {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => {
      this.cancelSubscription({ id: $scope.subscription.id }).then(onCancel);
    });
  };
}
