angular
  .module('walletApp')
  .controller('MobileConversionCtrl', MobileConversionCtrl);

function MobileConversionCtrl ($scope, Wallet, $uibModalInstance, Alerts) {
  $scope.hideQR = true;
  $scope.pairingCode = null;

  $scope.ok = () => $uibModalInstance.close();

  $scope.makeQR = () => {
    const success = (code) => {
      $scope.pairingCode = code;
      $scope.hideQR = false;
    };
    const error = (err) => {
      if (err === 'cancelled' || err === 'backdrop click') return;
      let msg = 'SHOW_PAIRING_CODE_FAIL';
      Alerts.displayError(msg);
    };

    Wallet.makePairingCode(success, error);
  };
}
