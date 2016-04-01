angular
  .module('walletApp')
  .controller('SweepAllController', SweepAllController);

function SweepAllController($scope, $q, $timeout, $translate, Wallet, Alerts) {
  $scope.alerts = [];
  $scope.settings = Wallet.settings;
  $scope.defaultAccount = Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);

  $scope.sweeping = false;
  $scope.ncompleted = 0;
  $scope.ntotal = $scope.addresses.length;
  $scope.succeeded = [];
  $scope.failed = [];

  $scope.sweepAll = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.sweeping = true;
    $scope.addresses.reduce((chain, a) => chain.then(() => {
      console.log('sweeping:', a.address);

      let payment = new Wallet.payment();
      payment.to($scope.defaultAccount.index).from(a.address).useAll();

      return payment.build().sign(pw).publish().payment
        .then(() => { a.active = false; $scope.succeeded.push(a); })
        .catch(() => $scope.failed.push(a))
        .then(() => $scope.ncompleted++);

    }), $q.resolve()).then(() => {
      $scope.sweeping = false;
    });
  });
}
