angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, Wallet, currency, modals) {
  let exchange = $scope.vm.external.sfox;
  if (!exchange.profile) return;

  $scope.signupCompleted = exchange.profile.verificationStatus === 'verified';
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);

  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.btcAccount = Wallet.getDefaultAccount();

  $scope.minLimit = currency.convertToSatoshi(10, $scope.dollars);
  $scope.maxLimit = currency.convertToSatoshi(300, $scope.dollars);

  $scope.state = {
    amount: $scope.maxLimit
  };

  $scope.buy = () => {
    $scope.lock();
    $timeout($scope.free, 1000);
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });

  $scope.installLock();
}
