angular
  .module('walletApp')
  .controller('TransferController', TransferController);

function TransferController($scope, $state, $timeout, $q, $uibModalInstance, Wallet, Alerts, address) {
  $scope.accounts = Wallet.accounts;
  $scope.selectedAccount = Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.addresses = Array.isArray(address) ? address : [address];
  $scope.combinedBalance = $scope.addresses.reduce((t, a) => t + a.balance, 0);

  $scope.status = { loading: true };
  $scope.ncomplete = 0;
  $scope.ntotal = $scope.addresses.length;

  $scope.wait = (t) => $q(r => $timeout(r, t));

  $scope.initializePayments = () => {
    let index = $scope.selectedAccount.index;
    $scope.payments = $scope.addresses.map(a => (
      new Wallet.payment().from(a.address).to(index).useAll()
    ));
    let paymentsP = $scope.payments.map(p => $q(resolve => p.sideEffect(resolve)));
    $q.all(paymentsP).then(paymentData => {
      $scope.totalAmount = paymentData.filter(p => p.amounts[0] > 0).reduce((t, p) => t + p.amounts[0], 0);
      $scope.totalFees = paymentData.filter(p => p.finalFee > 0).reduce((t, p) => t + p.finalFee, 0);
      $scope.status.loading = false;
    });
  };

  $scope.transfer = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.status.sweeping = true;

    const success = () => $scope.wait(500).then(() => {
      $scope.refresh();
      if ($scope.nfailed > 0 || $scope.ncompleted === 0) Alerts.displayWarning('SWEEP_FAIL');
      $state.go('wallet.common.transactions', { accountIndex: $scope.selectedAccount.index });
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
        if (p.amounts[0] <= 0) throw 'SWEEP_LOW_BALANCE_ERR';
        else $scope.selectedAccount.incrementReceiveIndex();
      });

      return $scope.wait(250).then(signAndPublish)
        .then(() => $scope.addresses[i].archived = true)
        .catch(e => $scope.nfailed++)
        .then(() => $scope.ncomplete++);

    }), $q.resolve())
      .then(success).catch(error);
  });

  $scope.initializePayments();
}
