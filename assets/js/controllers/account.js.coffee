@AccountCtrl = ($scope, Wallet, $cookies, $modalInstance) ->
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.logout = () ->    
    $scope.uid = null
    $scope.password = null
    delete $cookies.password
    delete $cookies.uid
    Wallet.logout()
  
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()