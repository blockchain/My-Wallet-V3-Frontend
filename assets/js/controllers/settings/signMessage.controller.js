angular
  .module('walletApp')
  .controller('SignMessageController', SignMessageController);

function SignMessageController($scope, Wallet) {
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);
  $scope.address = $scope.addresses[0];
  $scope.message = '';

  $scope.formatLabel = (addr) => addr.address + (addr.label ? ` (${addr.label})` : '');

  $scope.reset = () => $scope.signature = false;

  $scope.sign = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.signature = $scope.address.signMessage($scope.message, pw);
  });
}
