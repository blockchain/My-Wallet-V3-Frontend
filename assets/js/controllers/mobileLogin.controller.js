angular
  .module('walletApp')
  .controller('MobileLoginController', MobileLoginController);

function MobileLoginController ($scope, $state, Wallet, MyWallet, Alerts) {
  $scope.scannerOn = true;

  $scope.success = '#00A76F';
  $scope.error = '#CA3A3C';

  $scope.onScanError = (error) => {
    Alerts.displayError(error);
  };

  $scope.onScanResult = (result) => {
    let success = () => { $state.go('wallet.common.home'); };
    let error = (e) => { Alerts.displayError(e); };

    MyWallet.parsePairingCode(result)
      .then((data) => {
        $scope.scanComplete = true;
        let { guid, password, sharedKey } = data;
        Wallet.login(guid, password, null, null, success, error, sharedKey);
      })
      .catch((error) => {
        console.log(error);
        $scope.scanFailed = true;
        Alerts.displayError('Error reading pairing code');
      })
      .then(() => {
        $scope.scannerOn = false;
      });
  };

  $scope.retryScan = () => {
    $scope.scannerOn = true;
    $scope.scanFailed = false;
  };
}
