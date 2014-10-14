@AccountCtrl = ($scope, Wallet, $cookieStore, $modalInstance) ->
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.logout = () ->    
    $scope.uid = null
    $scope.password = null
    $cookieStore.remove("password")
    $cookieStore.remove("uid")
    Wallet.logout() # Refreshes the browser, so won't return
  
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()