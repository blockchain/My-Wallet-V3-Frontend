angular
  .module('walletApp')
  .controller('ChangeLogoutTimeCtrl', ChangeLogoutTimeCtrl);

function ChangeLogoutTimeCtrl ($scope, Wallet) {
  $scope.reset = () => {
    $scope.fields = { logoutTime: Wallet.settings.logoutTimeMinutes };
  };

  $scope.setLogoutTime = () => {
    $scope.status.waiting = true;
    Wallet.setLogoutTime($scope.fields.logoutTime, $scope.deactivate, $scope.deactivate);
  };
}
