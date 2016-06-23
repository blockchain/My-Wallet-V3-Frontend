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

  $scope.setLogoutTime = () => {
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
