angular
  .module('walletApp')
  .controller('SettingsInfoCtrl', SettingsInfoCtrl);

function SettingsInfoCtrl ($scope, $q, modals, Wallet, Alerts, MyWallet, Env) {
  angular.extend($scope, Wallet.user);
  $scope.loading = {};
  $scope.pairingCode = null;
  $scope.showMewSweep = modals.showMewSweep;

  Env.then((env) => {
    $scope.showMew = env.ethereum.mew;
  });

  $scope.removeAlias = () => {
    $scope.loading.alias = true;
    Alerts.confirm('CONFIRM_REMOVE_ALIAS', { props: { 'UID': $scope.guid } })
      .then(Wallet.removeAlias)
      .then(() => $scope.alias = Wallet.user.alias, () => {})
      .then(() => $scope.loading.alias = false);
  };

  $scope.hidePairingCode = () => {
    $scope.pairingCode = null;
  };

  $scope.showPairingCode = () => {
    $scope.loading.code = true;

    let success = (code) => { $scope.pairingCode = code; };

    let error = (err) => {
      if (err === 'cancelled' || err === 'backdrop click') return;
      Alerts.displayError('SHOW_PAIRING_CODE_FAIL');
    };

    $q(Wallet.makePairingCode)
      .then(success, error)
      .then(() => $scope.loading.code = false);
  };
}
