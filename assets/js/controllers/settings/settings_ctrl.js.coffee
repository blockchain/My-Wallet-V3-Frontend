@SettingsCtrl = ($scope, Wallet, $cookieStore, $state) ->    
  if $state.current.name == "settings"
    $state.go "settings.my-details"

  $scope.didLoad = () ->
    Wallet.clearAlerts()
    $scope.status = Wallet.status
    
    if !$scope.status.isLoggedIn 
      if !!$cookieStore.get("password") 
        # Restore after browser refresh (developer feature)
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else
        # $state.go("dashboard")
        $state.go("transactions", {accountIndex: null})
  # First load:      
  $scope.didLoad()