angular
  .module('walletApp')
  .controller("SecondPasswordCtrl", SecondPasswordCtrl);

function SecondPasswordCtrl($scope, $log, Wallet, $modalInstance, $translate, insist, defer) {
  $scope.insist = insist ? true : false;
  $scope.alerts = [];
  $scope.busy = false;
  $scope.secondPassword = "";

  $scope.cancel = () => {
    defer.reject($translate.instant('SECOND_PASSWORD_CANCEL'));
    Wallet.clearAlerts($scope.alerts);
    $modalInstance.dismiss("");
  };

  $scope.submit = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    Wallet.clearAlerts($scope.alerts);
    if (Wallet.validateSecondPassword($scope.secondPassword)) {
      $scope.busy = false;
      defer.resolve($scope.secondPassword);
      $modalInstance.close("");
    } else {
      $scope.busy = false;
      $translate("SECOND_PASSWORD_INCORRECT").then(translation => {
        Wallet.displayError(translation, false, $scope.alerts);
      });
    }
  };

}
