walletApp.controller("AlertsCtrl", ($scope, Wallet) => {
  $scope.alerts = Wallet.alerts;

  $scope.closeAlert = alert => {
    Wallet.closeAlert(alert);
  };
});
