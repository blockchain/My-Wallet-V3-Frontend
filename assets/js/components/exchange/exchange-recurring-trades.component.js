angular
  .module('walletApp')
  .component('exchangeRecurringTrades', {
    bindings: {
      subscription: '<',
      buy: '<',
      namespace: '<',
      partnerService: '<',
      trades: '&',
      cancelSubscription: '&'
    },
    templateUrl: 'templates/exchange/recurring-trades.pug',
    controller: ExchangeRecurringTradesController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringTradesController ($scope, $rootScope, Alerts, MyWallet, Exchange) {
  $scope.state = {};
  $scope.subscription = this.subscription;
  $scope.trades = this.trades()().filter((t) => t.tradeSubscriptionId === $scope.subscription.id);
  $scope.recurringDateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy';
  $scope.dateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy, HH:mm';
  $scope.canCancel = (t) => t.state === 'awaiting_transfer_in';
  $scope.classHelper = Exchange.classHelper;
  $scope.displayHelper = (trade) => `${this.namespace}.buy.${trade.state}.DISPLAY`;

  $scope.buyHandler = (trade) => {
    let { frequency, endTime } = this.subscription;
    this.buy(null, trade, frequency, endTime);
  };

  $scope.onCancel = (res) => $scope.subscription.isActive = res.isActive;

  $scope.cancelTrade = (trade) => {
    if (!$scope.canCancel(trade)) return;
    let message = this.subscription.isActive ? 'CONFIRM_CANCEL_RECURRING_TRADE' : 'CONFIRM_CANCEL_TRADE';
    let exchange = this.partnerService.exchange;
    this.partnerService.cancelTrade(trade, message)
      .then(() => Exchange.fetchProfile(exchange))
      .then(() => this.partnerService.getSubscriptions())
      .then(() => {
        let sub = this.partnerService.subscriptions.filter(s => s.id === $scope.subscription.id)[0];
        sub.isActive ? $scope.onCancel(sub) : '';
      });
  };

  $scope.cancel = () => {
    Alerts.confirm('CONFIRM_CANCEL_RECURRING_SUBSCRIPTION', {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => {
      this.cancelSubscription({ id: $scope.subscription.id }).then($scope.onCancel);
    });
  };
}
