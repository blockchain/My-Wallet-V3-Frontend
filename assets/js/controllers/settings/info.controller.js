angular
  .module('walletApp')
  .controller('SettingsInfoCtrl', SettingsInfoCtrl);

function SettingsInfoCtrl ($scope, $q, Wallet, Alerts) {
  angular.extend($scope, Wallet.user);
  $scope.loading = {};
  $scope.pairingCode = null;

  $scope.removeAlias = () => {
    $scope.loading.alias = true;
    Alerts.confirm('CONFIRM_DISABLE_ALIAS', { id: $scope.guid })
      .then(Wallet.removeAlias)
      .then(() => $scope.alias = Wallet.user.alias, () => {})
      .then(() => $scope.loading.alias = false);
  };

  $scope.hidePairingCode = () => {
    $scope.pairingCode = null;
  };

  $scope.showPairingCode = () => {
    $scope.loading.code = true;
    let success = (code) => $scope.pairingCode = code;
    let error = () => Alerts.displayError('SHOW_PAIRING_CODE_FAIL');
    $q(Wallet.makePairingCode)
      .then(success, error)
      .then(() => $scope.loading.code = false);
  };
}
