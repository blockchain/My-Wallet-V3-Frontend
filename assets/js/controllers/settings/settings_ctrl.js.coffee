@SettingsCtrl = ($scope, Wallet, $cookieStore, $state) ->    
  $scope.didLoad = () ->
    Wallet.clearAlerts()
    $scope.status = Wallet.status
    
    if !$scope.status.isLoggedIn 
      if !!$cookieStore.get("password") 
        # Restore after browser refresh (developer feature)
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else
        $state.go("dashboard")
  
  # First load:      
  $scope.didLoad()
  
