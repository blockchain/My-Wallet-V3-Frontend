angular
  .module('walletApp')
  .controller("SecondPasswordCtrl", SecondPasswordCtrl);

function SecondPasswordCtrl($scope, $log, Wallet, Alerts, $uibModalInstance, $translate, insist, defer) {
  $scope.insist = insist ? true : false;
  $scope.alerts = [];
  $scope.busy = false;
  $scope.secondPassword = "";

  $scope.cancel = () => {
    defer.reject($translate.instant('SECOND_PASSWORD_CANCEL'));
    Alerts.clear($scope.alerts);
    $uibModalInstance.dismiss("");
  };

  $scope.submit = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    if (Wallet.validateSecondPassword($scope.secondPassword)) {
      $scope.busy = false;
      defer.resolve($scope.secondPassword);
      $uibModalInstance.close("");
    } else {
      $scope.busy = false;
      Alerts.displayError('SECOND_PASSWORD_INCORRECT', false, $scope.alerts);
    }
  };

}
