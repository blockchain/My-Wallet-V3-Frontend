angular
  .module('walletApp')
  .controller('CoinifySignupController', CoinifySignupController);

function CoinifySignupController ($scope, $stateParams, AngularHelper, Alerts, buySell, currency) {
  let exchange = buySell.getExchange();
  let { fiatCurrency, refreshQuote } = $scope.vm;

  let tryParse = (json) => {
    try { return JSON.parse(json); } catch (e) { return json; }
  };

  $scope.signup = () => {
    $scope.lock();
    return exchange.signup($stateParams.countryCode, fiatCurrency())
      .then(() => exchange.fetchProfile())
      .then((p) => buySell.getMaxLimits(p.defaultCurrency))
      .then(refreshQuote).then((q) => $scope.vm.quote = q)
      .then(() => $scope.vm.goTo('select-payment-medium'))
      .catch((err) => {
        err = tryParse(err);
        if (err.error && err.error.toUpperCase() === 'EMAIL_ADDRESS_IN_USE') {
          $scope.vm.rejectedEmail = true;
          $scope.vm.goTo('email');
        }
      })
      .then($scope.free);
  };

  AngularHelper.installLock.call($scope);
}
