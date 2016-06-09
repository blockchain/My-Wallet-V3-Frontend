angular
  .module('walletApp')
  .controller('ChangeEmailCtrl', ChangeEmailCtrl);

function ChangeEmailCtrl ($rootScope, $scope, Wallet, $translate) {
  $scope.fields = {
    email: ''
  };

  $scope.errors = {};
  $scope.status = {};
  $scope.active = false;

  $scope.reset = () => {
    $scope.fields = {
      email: ''
    };

    $scope.errors = {};
    $scope.status = {};
    $scope.active = false;

    $scope.form.$setPristine();
    $scope.form.$setUntouched();
    $scope.$root.$safeApply($scope);
  };

  $scope.activate = () => {
    $scope.active = true;
  };

  $scope.deactivate = () => {
    $scope.active = false;
    $scope.reset();
  };

  $scope.changeEmail = () => {
    const success = () => {
      Wallet.saveActivity(2);
      $scope.reset();
    };

    const error = () => {
      $scope.error = 'Please enter a valid email address.';
    };

    Wallet.changeEmail($scope.fields.email, success, error);
  };
}
