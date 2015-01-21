@NavigationCtrl = ($scope, Wallet, SecurityCenter, $translate, $cookieStore, $state) ->
  
  $scope.securityIconURL = ""
  $scope.status = Wallet.status
  $scope.security = SecurityCenter.security
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watch "security.level", () ->
    switch $scope.security.level
      when null then $scope.securityIconURL = "img/security-icon.png"
      when 1 then $scope.securityIconURL = "img/security-icon.png"; console.log "1"
      when 2 then $scope.securityIconURL = "img/security-icon.png"
      when 3 then $scope.securityIconURL = "img/security-icon.png"
      

  $scope.doLogout = () ->   
    $translate("ARE_YOU_SURE_LOGOUT").then (translation) ->      
      if confirm translation
        $scope.uid = null
        $scope.password = null
        $cookieStore.remove("password")
        $cookieStore.remove("uid")
        # $state.go("dashboard")
        $state.go("transactions", {accountIndex: "accounts"})
        
        Wallet.logout() # Refreshes the browser, so won't return