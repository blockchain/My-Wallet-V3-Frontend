angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $q, Wallet, Alerts, currency, modals, accounts) {
  let exchange = $scope.vm.external.sfox;
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);

  if (!exchange.profile || !accounts.length) return;

  $scope.inspectTrade = modals.openTradeSummary.bind(null, 'processing');
  $scope.signupCompleted = accounts[0].status === 'active';

  $scope.format = currency.formatCurrencyForView;
  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.btcAccount = Wallet.getDefaultAccount();

  $scope.account = accounts[0];
  $scope.trades = exchange.trades;
  $scope.min = 10;
  $scope.max = 100;

  $scope.state = {
    fiat: $scope.max,
    btc: 0,
    baseCurr: $scope.dollars,
    get quoteCurr () { return this.baseFiat ? $scope.bitcoin : $scope.dollars; },
    get baseFiat () { return this.baseCurr === $scope.dollars; }
  };

  $scope.buy = () => {
    $scope.lock();
    $q.resolve($scope.quote.getPaymentMediums())
      .then(mediums => mediums.ach.buy($scope.account))
      .then(trade => { modals.openTradeSummary('initiated', trade); })
      .catch(error => { Alerts.displayError(error); })
      .then($scope.refreshQuote)
      .finally($scope.free);
  };

  $scope.getQuoteArgs = (state) => [
    state.baseFiat ? state.fiat * 100 : state.btc,
    state.baseCurr.code,
    state.quoteCurr.code
  ];

  $scope.refreshQuote = () => {
    $scope.state.quote = 0;
    let args = $scope.getQuoteArgs($scope.state);
    $q.resolve(exchange.getBuyQuote(...args)).then(quote => {
      $scope.quote = quote;
      if ($scope.state.baseFiat) $scope.state.btc = quote.quoteAmount;
      else $scope.state.fiat = quote.quoteAmount / 100;
    });
  };

  $scope.$watch('state.fiat + state.btc + state.baseCurr', () =>
    $scope.checkoutForm.$valid && $scope.refreshQuote()
  );

  $scope.installLock();
}
