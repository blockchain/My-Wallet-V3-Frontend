angular
  .module('walletApp')
  .controller('ShowPrivateKeyCtrl', ShowPrivateKeyCtrl);

function ShowPrivateKeyCtrl($scope, $uibModalInstance, Wallet, MyWalletHelpers, addressObj) {
  $scope.accessAllowed = false;
  $scope.address = addressObj.address;
  $scope.balance = addressObj.balance;

  $scope.format = 'WIF';
  $scope.formats = ['WIF', 'Base58'];
  $scope.privKeys = { WIF: '', Base58: '' };

  $scope.tryContinue = () => {
    Wallet.askForSecondPasswordIfNeeded().then(secondPassword => {
      let pk  = Wallet.my.wallet.getPrivateKeyForAddress(addressObj, secondPassword);
      let fmt = MyWalletHelpers.detectPrivateKeyFormat(pk);
      $scope.privKeys.Base58 = pk;
      $scope.privKeys.WIF = MyWalletHelpers.privateKeyStringToKey(pk, fmt).toWIF();
      $scope.accessAllowed = true;
    });
  };

  $scope.close = () => $uibModalInstance.dismiss('');
}
