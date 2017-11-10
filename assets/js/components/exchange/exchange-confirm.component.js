angular
  .module('walletApp')
  .component('exchangeConfirm', {
    bindings: {
      fiat: '<',
      quote: '<',
      details: '<',
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
  $scope.details = this.details;
  $scope.tradeState = '.confirm';

  $scope.getTimeToExpiration = () => this.quote.expiresAt - new Date();
  $scope.onExpiration = () => { $scope.lock(); this.quote = null; this.onExpiration().then($scope.free); };

  $scope.trade = () => {
    $scope.lock();
    let quote = this.quote;

    this.handleTrade({quote: quote})
      .then(trade => {
        this.onSuccess({trade});
      }).catch((err) => {
        Alerts.displayError(Exchange.interpretError(err));
      }).finally($scope.free);
  };

  AngularHelper.installLock.call($scope);
  Env.then(env => $scope.qaDebugger = env.qaDebugger);
  $scope.$watch('$ctrl.quote', () => $scope.getDetails());
}
