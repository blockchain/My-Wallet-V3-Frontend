angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, sfox, accounts) {
  let exchange = $scope.vm.external.sfox;
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card' }
    };
    let step = sfox.determineStep(exchange, accounts);
    return stepDescriptions[step];
  };

  if (!exchange.profile || !accounts.length) return;

  $scope.user = Wallet.user;
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

  let state = $scope.state = {
    fiat: $scope.max,
    btc: 0,
    fee: 0,
    baseCurr: $scope.dollars,
    get quoteCurr () { return this.baseFiat ? $scope.bitcoin : $scope.dollars; },
    get baseFiat () { return this.baseCurr === $scope.dollars; },
    get total () { return this.fiat + this.fee; }
  };

  $scope.buy = () => {
    $scope.lock();
    $q.resolve($scope.quote.getPaymentMediums())
      .then(mediums => mediums.ach.buy($scope.account))
      .then(trade => { modals.openTradeSummary('initiated', trade); })
      .catch(() => { Alerts.displayError('Error connecting to our exchange partner'); })
      .then($scope.refreshQuote)
      .finally($scope.free);
  };

  $scope.getQuoteArgs = (state) => [
    state.baseFiat ? state.fiat * 100 : state.btc,
    state.baseCurr.code,
    state.quoteCurr.code
  ];

  $scope.cancelRefresh = () => {
    $timeout.cancel($scope.refreshTimeout);
  };

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    state.quote = 0;
    $scope.cancelRefresh();
    let args = $scope.getQuoteArgs(state);

    let fetchSuccess = (quote) => {
      $scope.quote = quote;
      state.loadFailed = false;
      let timeToExpiration = new Date(quote.expiresAt) - new Date();
      $scope.refreshTimeout = $timeout($scope.refreshQuote, timeToExpiration);
      state.fee = quote.feeAmount / 100;
      if (state.baseFiat) state.btc = quote.quoteAmount;
      else state.fiat = quote.quoteAmount / 100;
    };

    $q.resolve(exchange.getBuyQuote(...args))
      .then(fetchSuccess, () => { state.loadFailed = true; });
  }, 500);

  $scope.refreshIfValid = (field) => $scope.checkoutForm[field].$valid && $scope.refreshQuote();
  $scope.$watch('state.fiat', () => state.baseFiat && $scope.refreshIfValid('fiat'));
  $scope.$watch('state.btc', () => !state.baseFiat && $scope.refreshIfValid('btc'));
  $scope.$on('$destroy', $scope.cancelRefresh);
  $scope.installLock();
}
