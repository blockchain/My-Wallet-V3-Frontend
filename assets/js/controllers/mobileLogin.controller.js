angular
  .module('walletApp')
  .controller('MobileLoginController', MobileLoginController);

function MobileLoginController ($scope, $state, Wallet, Alerts) {
  $scope.scannerOn = true;

  $scope.onScanError = (error) => {
    Alerts.displayError(error);
  };

  $scope.onScanResult = (result) => {
    $scope.scannerOn = false;
    $scope.scanComplete = true;

    let [uid, password, sharedKey] = result.split('|');

    let success = () => { $state.go('wallet.common.home'); };
    let error = (e) => { Alerts.displayError(e); };

    Wallet.login(uid, password, null, null, success, error, sharedKey);
  };
}
