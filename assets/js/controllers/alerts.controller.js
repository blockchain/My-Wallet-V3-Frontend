angular
  .module('walletApp')
  .controller("AlertsCtrl", AlertsCtrl);

function AlertsCtrl($scope, Wallet) {
  $scope.alerts = Wallet.alerts;

  $scope.closeAlert = alert => {
    Wallet.closeAlert(alert);
  };
}
