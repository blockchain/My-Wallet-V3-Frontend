angular
  .module('walletApp')
  .component('exchangeRecurringTrades', {
    bindings: {
      trades: '&',
      subscription: '<'
    },
    templateUrl: 'templates/exchange/recurring-trades.pug',
    controller: ExchangeRecurringTradesController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringTradesController ($scope) {
  $scope.state = {};
  $scope.subscription = this.subscription;
  $scope.trades = this.trades()().filter((t) => t.tradeSubscriptionId === $scope.subscription.id);
}
