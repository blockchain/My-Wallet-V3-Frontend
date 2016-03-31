angular
  .module('walletApp')
  .controller("ChangePasswordCtrl", ChangePasswordCtrl);

function ChangePasswordCtrl($scope, $log, Wallet, Alerts, $uibModalInstance, $translate) {
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;
  $scope.uid = Wallet.user.uid;

  $scope.fields = {
    currentPassword: "",
    password: "",
    confirmation: ""
  };
  $scope.errors = {};
  $scope.status = {};

  $scope.isUserEmail = (candidate) => {
    return Wallet.user.email && candidate === Wallet.user.email;
  };

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.changePassword = () => {
    if (!$scope.passwordForm.$valid) return;

    const success = () => {
      $uibModalInstance.dismiss("");
      Wallet.saveActivity(2);
    };

    const error = (err) => {
      $scope.status.waiting = false;
      $scope.errors.unsuccessful = err;
    };

    $scope.status.waiting = true;
    $scope.$root.$safeApply($scope);
    Wallet.changePassword($scope.fields.password, success, error);
  };

  $scope.close = () => {
    Alerts.clear();
    $uibModalInstance.dismiss("");
  };

}
