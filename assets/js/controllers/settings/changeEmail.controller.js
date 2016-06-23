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
    if ($scope.form.$invalid) return;

    const success = () => {
      Wallet.saveActivity(2);
      $scope.deactivate();
    };

    const error = () => {
      $scope.error = 'Please enter a valid email address.';
    };

    $scope.status.waiting = true;
    Wallet.changeEmail($scope.fields.email, success, error);
  };
}
