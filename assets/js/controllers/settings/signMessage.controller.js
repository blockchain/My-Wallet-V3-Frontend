angular
  .module('walletApp')
  .controller('SignMessageController', SignMessageController);

function SignMessageController($scope, Wallet, addressObj) {
  $scope.address = addressObj;
  $scope.message = '';

  $scope.formatLabel = (addr) => addr.address + (addr.label ? ` (${addr.label})` : '');

  $scope.reset = () => $scope.signature = false;

  $scope.sign = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.signature = $scope.address.signMessage($scope.message, pw);
  });
}
