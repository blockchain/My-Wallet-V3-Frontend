angular
  .module('walletApp')
  .controller('MobileLoginController', MobileLoginController);

function MobileLoginController ($scope, $state, Wallet, MyWallet, Alerts) {
  $scope.scannerOn = true;

  $scope.onScanError = (error) => {
    Alerts.displayError(error);
  };

  $scope.onScanResult = (result) => {
    $scope.scannerOn = false;
    $scope.scanComplete = true;

    let success = () => { $state.go('wallet.common.home'); };
    let error = (e) => { Alerts.displayError(e); };

    MyWallet.parsePairingCode(result)
      .then((data) => {
        let { guid, password, sharedKey } = data;
        Wallet.login(guid, password, null, null, success, error, sharedKey);
      })
      .catch((error) => {
        console.log(error);
        Alerts.displayError('Error reading pairing code');
      });
  };
}
