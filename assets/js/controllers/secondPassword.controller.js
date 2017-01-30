angular
  .module('walletApp')
  .controller('SecondPasswordCtrl', SecondPasswordCtrl);

function SecondPasswordCtrl ($scope, $log, Wallet, Alerts, $uibModalInstance, $translate, insist) {
  $scope.insist = Boolean(insist);
  $scope.alerts = [];
  $scope.busy = false;
  $scope.secondPassword = '';

  $scope.cancel = () => {
    Alerts.clear($scope.alerts);
    $uibModalInstance.dismiss('SECOND_PASSWORD_CANCEL');
  };

  $scope.submit = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    if (Wallet.validateSecondPassword($scope.secondPassword)) {
      $scope.busy = false;
      $uibModalInstance.close($scope.secondPassword);
    } else {
      $scope.busy = false;
      Alerts.displayError('SECOND_PASSWORD_INCORRECT', false, $scope.alerts);
    }
  };
}
