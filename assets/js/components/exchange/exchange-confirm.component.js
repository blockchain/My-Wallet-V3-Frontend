angular
  .module('walletApp')
  .component('exchangeConfirm', {
    bindings: {
      type: '<',
      fiat: '<',
      quote: '<',
      payment: '<',
      provider: '<',
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
  let format = currency.formatCurrencyForView;
  let fiat = this.fiat;
  let btc = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.type = '.' + this.type;
  $scope.tradeState = '.confirm';
  $scope.namespace = this.provider.toUpperCase();

  $scope.getTimeToExpiration = () => this.quote.expiresAt - new Date();
  $scope.onExpiration = () => { $scope.lock(); this.quote = null; this.onExpiration().then($scope.free); };

  $scope.getDetails = () => {
    if (this.type === 'sell') {
      if (!this.quote) return;
      $scope.details = {
        txAmt: {
          key: '.AMT',
          val: format(currency.convertFromSatoshi(this.payment.amounts[0], btc), btc, true)
        },
        txFee: {
          key: '.TX_FEE',
          val: format(currency.convertFromSatoshi(this.payment.finalFee, btc), btc, true)
        },
        out: {
          key: '.TOTAL',
          val: format(currency.convertFromSatoshi(this.payment.amounts[0] + this.payment.finalFee, btc), btc, true)
        },
        in: {
          key: '.TO_BE_RECEIVED',
          val: format(this.quote.baseCurrency === 'BTC' ? this.quote.quoteAmount : this.quote.baseAmount, fiat, true),
          tip: () => console.log('Clicked tooltip')
        }
      };
    }
  };

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
