angular
  .module('walletApp')
  .controller('ChangeLogoutTimeCtrl', ChangeLogoutTimeCtrl);

function ChangeLogoutTimeCtrl ($scope, Wallet, Alerts, $translate) {
  $scope.settings = Wallet.settings;
  $scope.errors = {};
  $scope.status = {};
  $scope.active = false;

  $scope.fields = {
    logoutTime: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      logoutTime: ''
    };

    $scope.errors = {};
    $scope.status = {};
    $scope.active = false;

    $scope.form.$setPristine();
    $scope.form.$setUntouched();
    $scope.$root.$safeApply($scope);
  };

  $scope.activate = () => {
    $scope.active = true;
  };

  $scope.deactivate = () => {
    $scope.active = false;
    $scope.reset();
  };

  $scope.changeLogoutTime = () => {
    $scope.status.waiting = true;

    const error = () => {
      Alerts.displayError('Failed to update auto logout time');
    };
    const success = () => {
      $scope.deactivate();
    };

    Wallet.setLogoutTime($scope.fields.logoutTime, success, error);
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
}
