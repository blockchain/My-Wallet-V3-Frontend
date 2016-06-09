angular
  .module('walletApp')
  .controller('ChangePasswordCtrl', ChangePasswordCtrl);

function ChangePasswordCtrl ($scope, $log, Wallet, Alerts, $translate) {
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;
  $scope.uid = Wallet.user.uid;

  $scope.fields = {
    currentPassword: '',
    password: '',
    confirmation: ''
  };
  $scope.errors = {};
  $scope.status = {};
  $scope.active = false;

  $scope.reset = () => {
    $scope.fields = {
      currentPassword: '',
      password: '',
      confirmation: ''
    };
    $scope.errors = {};
    $scope.status = {};
    $scope.active = false;

    $scope.passwordForm.$setPristine();
    $scope.passwordForm.$setUntouched();
    $scope.$root.$safeApply($scope);
  };

  $scope.activate = () => {
    $scope.active = true;
  };

  $scope.deactivate = () => {
    $scope.active = false;
    $scope.reset();
  };

  $scope.isUserEmail = (candidate) => {
    return Wallet.user.email && candidate === Wallet.user.email;
  };

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.changePassword = () => {
    if (!$scope.passwordForm.$valid) return;

    const success = () => {
      Wallet.saveActivity(2);
      $scope.reset();
    };

    const error = (err) => {
      $scope.status.waiting = false;
      $translate(err).then(msg => $scope.errors.unsuccessful = msg);
    };

    $scope.status.waiting = true;
    $scope.$root.$safeApply($scope);
    Wallet.changePassword($scope.fields.password, success, error);
  };
}
