@AlertsCtrl = ($scope, Wallet) ->
  $scope.alerts = Wallet.alerts
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1
    return