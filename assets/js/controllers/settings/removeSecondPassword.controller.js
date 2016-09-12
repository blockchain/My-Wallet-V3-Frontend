angular
  .module('walletApp')
  .controller('RemoveSecondPasswordCtrl', RemoveSecondPasswordCtrl);

function RemoveSecondPasswordCtrl ($scope, Wallet, $timeout, Alerts, $uibModalInstance, $window) {
  $scope.alerts = [];
  $scope.status = {
    waiting: false,
    removed: false
  };
  $scope.form = {};
  $scope.fields = {
    password: ''
  };

  $scope.validateSecondPassword = Wallet.validateSecondPassword;

  $scope.cancel = () => {
    $uibModalInstance.dismiss('');
  };

  $scope.logout = () => {
    $window.location.reload('/wallet/#/login/' + Wallet.guid);
  };

  $scope.removeSecondPassword = () => {
    if ($scope.status.waiting) return;
    $scope.status.waiting = true;
    let success = () => {
      Alerts.displaySuccess('SECOND_PASSWORD_REMOVE_SUCCESS', true, $scope.alerts);
      $scope.status.waiting = false;
      $scope.status.removed = true;
    };
    let error = () => {
      Alerts.displayError('SECOND_PASSWORD_REMOVE_ERR');
      $scope.status.waiting = false;
    };

    Wallet.removeSecondPassword($scope.fields.password, success, error);
  };
}
