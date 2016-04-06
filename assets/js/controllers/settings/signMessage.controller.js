angular
  .module('walletApp')
  .controller('SignMessageController', SignMessageController);

function SignMessageController($scope, Wallet) {
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);
  $scope.address = $scope.addresses[0];
  $scope.message = '';

  $scope.sign = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.message = $scope.address.signMessage($scope.message, pw);
    $scope.signed = true;
  });
}
