@SecondPasswordCtrl = ($scope, $log, Wallet, $modalInstance, insist, continueCallback, cancelCallback) ->
  $scope.insist = if insist then true else false 
  $scope.alerts = Wallet.alerts
  
  $scope.busy = false
  
  $scope.secondPassword = ""
  
  $scope.cancel = () ->
    Wallet.clearAlerts()
    cancelCallback()
    $modalInstance.dismiss ""
  
  $scope.submit = () ->
    return if $scope.busy
    $scope.busy = true
    
    Wallet.clearAlerts()
    
    correctPassword = () ->
      $scope.busy = false
      $modalInstance.close ""
      
    wrongPassword = () ->
      Wallet.displayError("Second password incorrect")
      $scope.busy = false
      
    continueCallback($scope.secondPassword, correctPassword, wrongPassword)