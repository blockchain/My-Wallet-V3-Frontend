angular
  .module('walletApp')
  .controller('SweepAllController', SweepAllController);

function SweepAllController($scope, $q, $timeout, $translate, Wallet, Alerts) {
  $scope.alerts = [];
  $scope.settings = Wallet.settings;
  $scope.defaultAccount = Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);

  // dev
  let make = (i, elem) => Array.apply(null, { length: i }).map(_ => elem);
  let wait = (t) => $q(resolve => $timeout(resolve, t));

  let block = (t) => $q(resolve => {
    let future = Date.now() + t;
    while (future > Date.now());
    resolve();
  });

  $scope.addresses = $scope.addresses.concat(
    make(5, 'asdfasdftestimportedaddressasdfasdfasdf').map((a, i) => ({ address: a+i, balance: 10000 }))
  );
  // /dev

  $scope.state = {};
  $scope.failed = { amount: 0 };
  $scope.succeeded = { amount: 0 };

  $scope.ntotal = $scope.addresses.length;
  $scope.nsucceeded= 0;
  $scope.nfailed = 0;
  $scope.ncompleted = () => $scope.nfailed + $scope.nsucceeded;

  $scope.cancel = () => $scope.state.cancelled = true;

  $scope.sweepAll = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.state.sweeping = true;
    $scope.addresses.reduce((chain, a) => chain.then(() => {
      console.log('sweeping:', a.address);
      if ($scope.state.cancelled) return $q.reject('CANCELLED');

      /*
      let payment = new Wallet.payment();
      payment.to($scope.defaultAccount.index).from(a.address).useAll();
      */

      let signPromise = block(1000)// $q.resolve(payment.build().sign(pw).payment);

      let publish = () => {
        // dev
        let rejectionChance = 0.5;
        let reject = Math.random() < rejectionChance;
        // /dev
        let publishPromise = wait(500).then(() => reject ? $q.reject() : true)// $q.resolve(payment.publish().payment);
        return publishPromise;
      };

      return signPromise
        .then(() => $scope.state.cancelled ? $q.reject('CANCELLED') : null)
        .then(publish)
        // publish success
        .then(() => {
          // a.active = false;
          $scope.succeeded.amount += a.balance;
          $scope.succeeded[a.address] = true;
          $scope.nsucceeded++;
        })
        // publish fail
        .catch(() => {
          $scope.failed.amount += a.balance;
          $scope.failed[a.address] = true;
          $scope.nfailed++;
        });

    }), $q.resolve())
       // all success
      .then(() => {
        $scope.state.success = true;
        if ($scope.nfailed > 0) Alerts.displayWarning('SWEEP_FAIL', false, $scope.alerts);
      })
       // all fail
      .catch(reason => {
        $scope.state.failed = true;
        Alerts.displayWarning(reason, false, $scope.alerts);
      })
      // all complete
      .then(() => {
        $scope.state.sweeping = false;
        $scope.state.complete = true;
      });
  });
}
