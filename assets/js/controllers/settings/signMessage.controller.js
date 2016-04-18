angular
  .module('walletApp')
  .controller('SignMessageController', SignMessageController);

function SignMessageController($scope, Wallet, address) {
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);
  $scope.address = address;
  $scope.message = '';

  $scope.formatLabel = (addr) => addr.address + (addr.label ? ` (${addr.label})` : '');

  $scope.reset = () => $scope.signature = false;

  $scope.sign = () => Wallet.askForSecondPasswordIfNeeded().then(pw => {
    $scope.signature = $scope.address.signMessage($scope.message, pw);
  });
}
