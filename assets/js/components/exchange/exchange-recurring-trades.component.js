angular
  .module('walletApp')
  .component('exchangeRecurringTrades', {
    bindings: {
      subscription: '<',
      trades: '&',
      cancelSubscription: '&',
      buy: '&'
    },
    templateUrl: 'templates/exchange/recurring-trades.pug',
    controller: ExchangeRecurringTradesController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringTradesController ($scope, coinify) {
  $scope.state = {};
  $scope.subscription = this.subscription;
  $scope.trades = this.trades()().filter((t) => t.tradeSubscriptionId === $scope.subscription.id);
  $scope.buyHandler = this.buy;

  $scope.getClass = (trade) => {
    let c = '';

    if (coinify.tradeStateIn(coinify.states.error)(trade)) c = 'state-danger-text';
    else if (coinify.tradeStateIn(coinify.states.pending)(trade)) c = 'transfer';
    else if (coinify.tradeStateIn(coinify.states.success)(trade)) c = 'success';
    else c = '';

    return c;
  };

  $scope.cancel = () => this.cancelSubscription({ id: $scope.subscription.id });
}
