@SecondPasswordCtrl = ($scope, $log, Wallet, $modalInstance) ->
  $scope.cancel = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
  
  $scope.submit = () ->
    Wallet.clearAlerts()
    $modalInstance.close($scope.secondPassword)