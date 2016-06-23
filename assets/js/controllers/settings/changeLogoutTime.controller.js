angular
  .module('walletApp')
  .controller('ChangeLogoutTimeCtrl', ChangeLogoutTimeCtrl);

function ChangeLogoutTimeCtrl ($scope, Wallet, Alerts, $translate) {
  $scope.status = {};
  $scope.settings = Wallet.settings;

  $scope.fields = {
    logoutTime: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      logoutTime: ''
    };
  };

  $scope.validateLogoutTime = () => {
    let candidate = $scope.fields.logoutTime;
    let n = parseInt(candidate, 10);

    if (n <= 1) {
      $translate('LOGOUT_GREATER_THAN_1').then((t) => $scope.errors.logoutTime = t);
    } else if (n >= 1440) {
      $translate('LOGOUT_LESS_THAN_1440').then((t) => $scope.errors.logoutTime = t);
    } else {
      $scope.errors.logoutTime = '';
    }
  };

  $scope.setLogoutTime = () => {
    if ($scope.errors.logoutTime.length) return;

    const error = () => {
      Alerts.displayError('Failed to update auto logout time');
    };
    const success = () => {
      $scope.deactivate();
    };

    $scope.status.waiting = true;
    Wallet.setLogoutTime($scope.fields.logoutTime, success, error);
  };
}
