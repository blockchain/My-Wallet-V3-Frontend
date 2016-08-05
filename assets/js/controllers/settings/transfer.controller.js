angular
  .module('walletApp')
  .controller('TransferController', TransferController);

function TransferController ($scope, $state, $timeout, $q, $uibModalInstance, Wallet, Alerts, address) {
  $scope.accounts = Wallet.accounts;
  $scope.selectedAccount = Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.addresses = Array.isArray(address) ? address : [address];
  $scope.combinedBalance = $scope.addresses.reduce((t, a) => t + a.balance, 0);

  $scope.status = { loading: true };
  $scope.nfailed = 0;
  $scope.ncomplete = 0;
  $scope.archivable = [];
  $scope.ntotal = $scope.addresses.length;

  $scope.wait = (t) => $q(r => $timeout(r, t));

  $scope.initializePayments = () => {
    let index = $scope.selectedAccount.index;

    let paymentsP = $scope.addresses.reduce((chain, a) => chain.then(payments => $q(resolve => {
      let p = new Wallet.Payment().from(a.address).to(index).useAll();
      p.sideEffect(() => resolve(payments.concat(p)));
    })), $q.resolve([]));

    let paymentsDataP = paymentsP.then(payments => {
      $scope.payments = payments;
      return $q.all(payments.map(p => $q(resolve => p.sideEffect(resolve))));
    });

    paymentsDataP.then(paymentsData => {
      $scope.totalAmount = paymentsData.filter(p => p.amounts[0] > 0).reduce((t, p) => t + p.amounts[0], 0);
      $scope.totalFees = paymentsData.filter(p => p.finalFee > 0).reduce((t, p) => t + p.finalFee, 0);
      $scope.status.loading = false;
    });
  };

  $scope.archive = () => {
    $scope.archivable.forEach(a => a.archived = true);
    $uibModalInstance.dismiss();
  };

  $scope.transfer = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.status.sweeping = true;

    const success = () => $scope.wait(500).then(() => {
      let confirmString = $scope.archivable.length > 1 ? 'SWEEP_FINISHED' : 'SWEEP_FINISHED_SINGLE';
      Alerts.confirm(confirmString, {
        values: {
          archivable: $scope.archivable.length,
          account: $scope.selectedAccount.label,
          total: $scope.ncomplete + $scope.nfailed
        },
        action: 'ARCHIVE',
        friendly: true
      }).then($scope.archive).catch($uibModalInstance.dismiss);
    });

    const error = (e) => {
      let msg = typeof e === 'string' ? e : 'SWEEP_FAILED';
      Alerts.displayError(msg);
      $uibModalInstance.dismiss();
    };

    $scope.payments.reduce((chain, payment, i) => chain.then(() => {
      if ($scope.status.cancelled) return $q.reject('CANCELLED');
      let signAndPublish = () => $q.resolve(payment.build().sign(pw).publish().payment);

      payment.sideEffect(p => {
        let sweepErr = 'SWEEP_LOW_BALANCE_ERR';
        if (p.amounts[0] <= 0) throw sweepErr;
        else $scope.selectedAccount.incrementReceiveIndex();
      });

      return $scope.wait(250).then(signAndPublish)
        .then(() => $scope.archivable.push($scope.addresses[i]))
        .catch(e => $scope.nfailed++)
        .then(() => $scope.ncomplete++);
    }), $q.resolve())
      .then(success).catch(error);
  });

  $scope.initializePayments();
}
