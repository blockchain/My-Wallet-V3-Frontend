@SecondPasswordCtrl = ($scope, $log, Wallet, $modalInstance, insist) ->
  $scope.insist = if insist then true else false 
  
  $scope.cancel = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
  
  $scope.submit = () ->
    Wallet.clearAlerts()
    if Wallet.isCorrectSecondPassword($scope.secondPassword)
      $modalInstance.close($scope.secondPassword)
    else 
      Wallet.displayError("Wrong password")