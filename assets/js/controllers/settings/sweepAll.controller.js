angular
  .module('walletApp')
  .controller('SweepAllController', SweepAllController);

function SweepAllController($scope, $q, $timeout, $translate, Wallet, Alerts) {
  $scope.alerts = [];
  $scope.settings = Wallet.settings;
  $scope.defaultAccount = Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);

  $scope.state = {};
  $scope.failed = { value: 0, count: 0 };
  $scope.succeeded = { value: 0, count: 0, signed: 0 };

  $scope.ntotal = $scope.addresses.length;
  $scope.ncompleted = () => $scope.failed.count + $scope.succeeded.count;

  $scope.cancel = () => $scope.state.cancelled = true;
  $scope.wait = (t) => $q(resolve => $timeout(resolve, t));

  $scope.sweepAll = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    let finalFee = 0;
    $scope.state.sweeping = $scope.state.signing = true;

    $scope.addresses.reduce((chain, a) => chain.then((publishers) => {
      if ($scope.state.cancelled) return $q.reject('CANCELLED');

      let payment = new Wallet.payment();
      payment.to($scope.defaultAccount.index).from(a.address).useAll();
      payment.sideEffect(p => finalFee += p.finalFee)
      $scope.defaultAccount.incrementReceiveIndex();

      let sign = () => $q.resolve(payment.build().sign(pw).payment);
      let publish = () => $q.resolve(payment.publish().payment);

      return $scope.wait(100).then(sign).then(() => {
        $scope.succeeded.signed++;
        return publishers.concat(publish);
      }).catch(() => $q.reject($translate.instant('SIGN_FAIL', { address: a.address })));

    }), $q.resolve([])).then(publishers => {
      $scope.state.signing = false

      return Alerts.confirm('CONTINUE_SWEEP', { addresses: $scope.ntotal, fees: finalFee })
        .then(() => ($scope.state.publishing = true) && publishers)
        .catch(() => $q.reject('CANCELLED'));

    }).then(publishers => publishers.reduce((chain, publish, i) => chain.then(() => {
      if ($scope.state.cancelled) return $q.reject('CANCELLED');
      let a = $scope.addresses[i];

      return publish()
        .then(() => {
          a.active = false;
          $scope.succeeded.value += a.balance;
          $scope.succeeded.count++;
          $scope.succeeded[a.address] = true;
        })
        .catch(() => {
          $scope.failed.value += a.balance;
          $scope.failed.count++;
          $scope.failed[a.address] = true;
        });

    }), $q.resolve()))
      .then(() => {
        $scope.state.success = true;
        $scope.refresh();
        if ($scope.nfailed > 0) Alerts.displayWarning('SWEEP_FAIL', false, $scope.alerts);
      })
      .catch(reason => {
        $scope.state.failed = true;
        Alerts.displayWarning(reason, false, $scope.alerts);
      })
      .then(() => {
        $scope.state.sweeping = $scope.state.publishing = false;
        $scope.state.complete = true;
      });
  });
}
