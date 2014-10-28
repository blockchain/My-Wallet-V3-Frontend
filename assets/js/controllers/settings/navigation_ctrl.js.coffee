@SettingsNavigationCtrl = ($scope, Wallet, $cookieStore, $state) ->
  $scope.status    = Wallet.status
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
      
  $scope.doLogout = () ->   
    $scope.uid = null
    $scope.password = null
    $cookieStore.remove("password")
    $cookieStore.remove("uid")
    $state.go("dashboard")
        
    Wallet.logout() # Refreshes the browser, so won't return
    
  