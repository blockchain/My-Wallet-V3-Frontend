angular
  .module('walletApp')
  .controller('SweepAllController', SweepAllController);

function SweepAllController($scope, $q, $timeout, $translate, Wallet, Alerts) {
  $scope.alerts = [];
  $scope.defaultIdx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);

  $scope.sweeping = false;
  $scope.ncompleted = 0;
  $scope.ntotal = $scope.addresses.length;
  $scope.failed = [];

  $scope.sweepAll = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.sweeping = true;
    $scope.addresses.reduce((chain, a) => chain.then(() => {
      console.log('sweeping:', a.address);

      let payment = new Wallet.payment();
      payment.to($scope.defaultIdx).from(a.address).useAll();

      return payment.build().sign(pw).publish().payment
        .then(() => a.active = false)
        .catch(() => $scope.failed.push(a.address))
        .then(() => $scope.ncompleted++);

    }), $q.resolve()).then(() => {
      $scope.sweeping = false;
      if ($scope.failed.length) $translate('SWEEP_FAIL').then(t => Alerts.displayWarning(t, false, $scope.alerts));
    });
  });
}
