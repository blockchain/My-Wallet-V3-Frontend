angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $q, Wallet, Alerts, currency, modals, accounts) {
  let exchange = $scope.vm.external.sfox;
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);

  if (!exchange.profile || !accounts.length) return;

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
    base: $scope.max * 100,
    quote: 0,
    primary: $scope.dollars,
    get secondary () {
      return this.primary === $scope.dollars ? $scope.bitcoin : $scope.dollars;
    },
    get fiat () {
      return (this.primary === $scope.dollars ? this.base : this.quote) / 100;
    },
    get btc () {
      return this.primary === $scope.bitcoin ? this.base : this.quote;
    },
    set fiat (value) {
      this.primary = $scope.dollars;
      this.base = value * 100;
    },
    set btc (value) {
      this.primary = $scope.bitcoin;
      this.base = value;
    }
  };

  $scope.buy = () => {
    $scope.lock();
    $q.resolve($scope.quote.getPaymentMediums())
      .then(mediums => mediums.ach.buy($scope.account))
      .then(() => { Alerts.displaySuccess('BOUGHT'); })
      .catch(error => { Alerts.displayError(error); })
      .finally($scope.free);
  };

  $scope.refreshQuote = () => {
    let s = $scope.state;
    let quoteP = exchange.getBuyQuote(s.base, s.primary.code, s.secondary.code);
    $q.resolve(quoteP).then(quote => {
      $scope.quote = quote;
      s.base = quote.baseAmount;
      s.quote = quote.quoteAmount;
    });
    s.quote = 0;
  };

  $scope.$watch('state.base', () =>
    $scope.checkoutForm.$valid && $scope.refreshQuote()
  );

  $scope.installLock();
}
