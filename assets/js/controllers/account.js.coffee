@AccountCtrl = ($scope, Wallet, $cookieStore, $modalInstance) ->
  
  $scope.settings = Wallet.settings
  $scope.languages = Wallet.languages
    
  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
  
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
    Wallet.logout() # Refreshes the browser, so won't return
  
    $modalInstance.dismiss ""
    
  $scope.$watch "settings.language", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeLanguage(newVal)
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    Wallet.clearAlerts()
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()