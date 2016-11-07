angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $q, Wallet, Alerts, currency, modals, accounts) {
  let exchange = $scope.vm.external.sfox;
  if (!exchange.profile || !accounts.length) return;

  $scope.signupCompleted = accounts[0].status === 'active';
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);

  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.btcAccount = Wallet.getDefaultAccount();

  $scope.account = accounts[0];
  $scope.trades = exchange.trades;
  $scope.minLimit = currency.convertToSatoshi(10, $scope.dollars);
  $scope.maxLimit = currency.convertToSatoshi(exchange.profile.limits.buy, $scope.dollars);

  $scope.state = {
    amount: $scope.maxLimit
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
    let amount = currency.convertFromSatoshi($scope.state.amount, $scope.dollars);
    exchange.getBuyQuote(amount, $scope.dollars.code, $scope.bitcoin.code)
      .then(quote => { $scope.quote = quote; });
  };

  $scope.$watch('state.amount', () =>
    $scope.checkoutForm.$valid && $scope.refreshQuote()
  );

  $scope.installLock();
}
