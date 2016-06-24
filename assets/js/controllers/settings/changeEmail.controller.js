angular
  .module('walletApp')
  .controller('ChangeEmailCtrl', ChangeEmailCtrl);

function ChangeEmailCtrl ($scope, Wallet) {
  $scope.reset = () => {
    $scope.fields = { email: Wallet.user.email };
  };

  $scope.changeEmail = () => {
    $scope.status.waiting = true;
    Wallet.changeEmail($scope.fields.email, $scope.deactivate, $scope.deactivate);
  };
}
