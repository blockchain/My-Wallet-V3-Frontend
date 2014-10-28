@SettingsNavigationCtrl = ($scope, Wallet, $cookieStore, $state, $translate) ->
  $scope.status    = Wallet.status
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
      
  $scope.doLogout = () ->   
    $translate("ARE_YOU_SURE_LOGOUT").then (translation) ->      
      if confirm translation
        $scope.uid = null
        $scope.password = null
        $cookieStore.remove("password")
        $cookieStore.remove("uid")
        $state.go("dashboard")
        
        Wallet.logout() # Refreshes the browser, so won't return
    
  