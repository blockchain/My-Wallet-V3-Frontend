angular
  .module('walletApp')
  .component('exchangeConfirm', {
    bindings: {
      type: '<',
      fiat: '<',
      quote: '<',
      details: '<',
      namespace: '<',
      tradeAccount: '<',
      onCancel: '&',
      onSuccess: '&',
      handleTrade: '&',
      handleQuote: '&',
      onExpiration: '&'
    },
    templateUrl: 'templates/exchange/confirm.pug',
    controller: ExchangeConfirmController,
    controllerAs: '$ctrl'
  });

function ExchangeConfirmController (Env, AngularHelper, $scope, $rootScope, $timeout, $q, Alerts, currency, Wallet, MyWalletHelpers, Exchange) {
  $scope.format = currency.formatCurrencyForView;
  $scope.type = '.' + this.type;
  $scope.tradeState = '.confirm';
  $scope.namespace = this.namespace;
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.getTimeToExpiration = () => this.quote.expiresAt - new Date() - 5000;
  $scope.onExpiration = () => { $scope.lock(); this.quote = null; this.onExpiration().then($scope.free); };

  $scope.trade = () => {
    $scope.lock();
    let quote = this.quote;

    this.handleTrade({quote: quote})
      .then(() => this.onSuccess())
      .catch((err) => { Alerts.displayError(Exchange.interpretError(err)); })
      .finally($scope.free);
  };

  AngularHelper.installLock.call($scope);
  Env.then(env => $scope.qaDebugger = env.qaDebugger);
  this.$onChanges = (changes) => {
    let curVal = changes.quote.currentValue;
    if (curVal.rate !== changes.quote.previousValue.rate) {
      $scope.rate = curVal.rate;
      this.details = changes.details.currentValue;
    }
  };
}
