angular
  .module('walletApp')
  .controller('SettingsInfoCtrl', SettingsInfoCtrl);

function SettingsInfoCtrl ($scope, $q, Wallet, Alerts) {
  $scope.uid = Wallet.user.uid;
  $scope.pairingCode = null;

  $scope.hidePairingCode = () => {
    $scope.pairingCode = null;
  };

  $scope.showPairingCode = () => {
    $scope.loading = true;
    let success = (code) => $scope.pairingCode = code;
    let error = () => Alerts.displayError('SHOW_PAIRING_CODE_FAIL');
    $q(Wallet.makePairingCode)
      .then(success, error)
      .then(() => $scope.loading = false);
  };
}
