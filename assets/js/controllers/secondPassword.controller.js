angular
  .module('walletApp')
  .controller("SecondPasswordCtrl", SecondPasswordCtrl);

function SecondPasswordCtrl($scope, $log, Wallet, Alerts, $modalInstance, $translate, insist, defer) {
  $scope.insist = insist ? true : false;
  $scope.alerts = [];
  $scope.busy = false;
  $scope.secondPassword = "";

  $scope.cancel = () => {
    defer.reject($translate.instant('SECOND_PASSWORD_CANCEL'));
    Alerts.clear($scope.alerts);
    $modalInstance.dismiss("");
  };

  $scope.submit = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    Alerts.clear($scope.alerts);
    if (Wallet.validateSecondPassword($scope.secondPassword)) {
      $scope.busy = false;
      defer.resolve($scope.secondPassword);
      $modalInstance.close("");
    } else {
      $scope.busy = false;
      $translate("SECOND_PASSWORD_INCORRECT").then(translation => {
        Alerts.displayError(translation, false, $scope.alerts);
      });
    }
  };

}
