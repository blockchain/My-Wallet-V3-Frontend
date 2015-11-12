angular
  .module('walletApp')
  .controller("AlertsCtrl", AlertsCtrl);

function AlertsCtrl($scope, Alerts) {
  $scope.alerts = Alerts.alerts;
  $scope.closeAlert = Alerts.close;
}
