angular
  .module('walletApp')
  .controller('MainPasswordCtrl', MainPasswordCtrl);

function MainPasswordCtrl ($scope, Wallet, Alerts, $uibModalInstance, $translate, defer) {
  $scope.alerts = [];
  $scope.busy = false;
  $scope.mainPassword = '';
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;
  $scope.isPasswordSubmissionDisabled = false;

  $scope.cancel = () => {
    defer.reject($translate.instant('MAIN_PASSWORD_CANCEL'));
    Alerts.clear($scope.alerts);
    $uibModalInstance.dismiss('');
  };

  $scope.submit = () => {
    if ($scope.isCorrectMainPassword($scope.mainPassword)) {
      $uibModalInstance.dismiss('');
      defer.resolve();
    } else {
      $scope.isPasswordSubmissionDisabled = true;
    }
  };

  $scope.handleKeyUp = (event) => {
    if (event.keyCode !== 13) {
      $scope.isPasswordSubmissionDisabled = false;
    }

    return;
  };
}
