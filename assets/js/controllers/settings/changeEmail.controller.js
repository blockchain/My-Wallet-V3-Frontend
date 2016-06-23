angular
  .module('walletApp')
  .controller('ChangeEmailCtrl', ChangeEmailCtrl);

function ChangeEmailCtrl ($rootScope, $scope, Wallet, $translate) {
  $scope.form = {};
  $scope.status = {};
  $scope.fields = {
    email: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      email: ''
    };
  };

  $scope.changeEmail = () => {
    const success = () => {
      Wallet.saveActivity(2);
      $scope.deactivate();
    };

    const error = () => {
      $scope.deactivate();
    };

    $scope.status.waiting = true;
    Wallet.changeEmail($scope.fields.email, success, error);
  };
}
