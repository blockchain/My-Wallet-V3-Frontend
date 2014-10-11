@AccountCtrl = ($scope, Wallet, $cookieStore, $modalInstance) ->
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.logout = () ->    
    $scope.uid = null
    $scope.password = null
    $cookieStore.remove("password")
    $cookieStore.remove("uid")
    Wallet.logout()
  
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()