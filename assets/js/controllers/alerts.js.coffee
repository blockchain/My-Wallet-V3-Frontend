@AlertsCtrl = ($scope, Wallet) ->
  $scope.alerts = Wallet.alerts
  $scope.$watchCollection "alerts", () ->
    
  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)