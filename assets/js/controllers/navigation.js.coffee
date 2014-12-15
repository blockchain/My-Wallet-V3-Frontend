@NavigationCtrl = ($scope, Wallet, $translate, $cookieStore, $state) ->
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()

  $scope.doLogout = () ->   
    $translate("ARE_YOU_SURE_LOGOUT").then (translation) ->      
      if confirm translation
        $scope.uid = null
        $scope.password = null
        $cookieStore.remove("password")
        $cookieStore.remove("uid")
        # $state.go("dashboard")
        $state.go("transactions", {accountIndex: null})
        
        Wallet.logout() # Refreshes the browser, so won't return