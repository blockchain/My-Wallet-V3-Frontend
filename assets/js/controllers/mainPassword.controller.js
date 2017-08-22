angular
  .module('walletApp')
  .controller('MainPasswordCtrl', MainPasswordCtrl);

function MainPasswordCtrl ($scope, Wallet, Alerts, $uibModalInstance, $translate, defer) {
  $scope.alerts = [];
  $scope.busy = false;
  $scope.mainPassword = '';
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;

  $scope.cancel = () => {
    defer.reject($translate.instant('MAIN_PASSWORD_CANCEL'));
    Alerts.clear($scope.alerts);
    $uibModalInstance.dismiss('');
  };

  $scope.submit = () => {
    $uibModalInstance.dismiss('');
    defer.resolve();
  };
}
