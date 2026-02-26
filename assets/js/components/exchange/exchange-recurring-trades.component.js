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
  $scope.trades = this.trades()().filter((t) => t.tradeSubscriptionId === this.subscription.id);
  $scope.recurringDateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy';
  $scope.dateFormat = $rootScope.size.xs ? 'MMM d' : 'd MMMM yyyy, HH:mm';
  $scope.canCancel = (t) => t.state === 'awaiting_transfer_in';
  $scope.classHelper = Exchange.classHelper;
  $scope.displayHelper = (trade) => `${this.namespace}.buy.${trade.state}.DISPLAY`;

  $scope.buyHandler = (trade) => {
    let { frequency, endTime } = this.subscription;
    this.buy(null, trade, frequency, endTime);
  };

  $scope.onCancel = (res) => this.subscription.isActive = res.isActive;

  let message = this.subscription.isActive ? 'CONFIRM_CANCEL_RECURRING_TRADE' : 'CONFIRM_CANCEL_TRADE';
  $scope.cancelTrade = (trade) => $scope.canCancel(trade) ? this.partnerService.cancelTrade(trade, message, this.subscription).then($scope.onCancel) : '';

  $scope.cancel = () => {
    Alerts.confirm('CONFIRM_CANCEL_RECURRING_SUBSCRIPTION', {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => {
      this.cancelSubscription({ id: this.subscription.id }).then($scope.onCancel);
    });
  };
}
