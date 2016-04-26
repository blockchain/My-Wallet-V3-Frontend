angular
  .module('walletApp')
  .controller('SettingsInfoCtrl', SettingsInfoCtrl);

function SettingsInfoCtrl ($scope, Wallet, Alerts, $translate, $window) {
  $scope.uid = Wallet.user.uid;

  $scope.display = {
    pairingCode: false
  };
  $scope.pairingCode = null;

  $scope.hidePairingCode = () => {
    $scope.pairingCode = null;
    $scope.display.pairingCode = false;
  };

  $scope.showPairingCode = () => {
    const success = (pairingCode) => {
      $scope.pairingCode = pairingCode;
      $scope.loading = false;
      $scope.display.pairingCode = true;
    };
    const error = () => {
      Alerts.displayError('Failed to load pairing code.');
      $scope.loading = false;
    };
    $scope.loading = true;
    Wallet.makePairingCode(success, error);
  };
}
