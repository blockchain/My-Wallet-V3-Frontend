angular
  .module('walletApp')
  .controller('ShowPrivateKeyCtrl', ShowPrivateKeyCtrl);

function ShowPrivateKeyCtrl($scope, $log, Wallet, Alerts, $modalInstance, $timeout, $translate, addressObj) {
  $scope.settings = Wallet.settings;
  $scope.accessAllowed = false;
  $scope.address = addressObj.address;
  $scope.balance = addressObj.balance;
  $scope.privKey = null;

  $scope.tryContinue = () => {
    Wallet.askForSecondPasswordIfNeeded().then(secondPassword => {
      $scope.accessAllowed = true;
      $scope.privKey = Wallet.my.wallet.getPrivateKeyForAddress(addressObj, secondPassword);
    });
  };

  $scope.close = () => {
    Alerts.clear();
    $modalInstance.dismiss('');
  };

}
