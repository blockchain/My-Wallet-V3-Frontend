@AccountCtrl = ($scope, Wallet, $cookieStore, $modalInstance, $state) ->
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.logout = () ->    
    $scope.uid = null
    $scope.password = null
    $cookieStore.remove("password")
    $cookieStore.remove("uid")
    Wallet.logout() # Refreshes the browser, so won't return
    $state.go("dashboard")
  
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()