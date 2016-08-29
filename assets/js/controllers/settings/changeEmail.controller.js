angular
  .module('walletApp')
  .controller('ChangeEmailCtrl', ChangeEmailCtrl);

function ChangeEmailCtrl ($scope, Wallet, MyWallet) {
  // TODO: add function to My-Wallet-V3 to check if the user has any exchange account:
  $scope.userHasExchangeAcct = MyWallet.wallet.external &&
                               MyWallet.wallet.external.coinify &&
                               MyWallet.wallet.external.coinify.user;

  $scope.reset = () => {
    $scope.fields = { email: Wallet.user.email };
  };

  $scope.changeEmail = () => {
    $scope.status.waiting = true;
    Wallet.changeEmail($scope.fields.email, $scope.deactivate, $scope.deactivate);
  };
}
