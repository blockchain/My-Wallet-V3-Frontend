@NavigationCtrl = ($scope, Wallet, SecurityCenter, $translate, $cookieStore, $state) ->
  
  $scope.status = Wallet.status
  $scope.security = SecurityCenter.security
  
  $scope.visitTransactions = () ->
    $state.go("wallet.common.transactions", {accountIndex:'accounts'})
  
  $scope.isTransactionState = () ->
    return $state.current.name == "wallet.common.transactions" || $state.current.name == "wallet.common.transaction"

  $scope.isSettingsState = () ->
    return $state.current.name.indexOf("wallet.common.settings") == 0 && $state.current.name != "wallet.common.settings.security-center"

  $scope.isSecurityState = () ->
    return $state.current.name == "wallet.common.settings.security-center" 
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
  
  #################################
  #           Private             #
  #################################
  

  $scope.doLogout = () ->   
    $translate("ARE_YOU_SURE_LOGOUT").then (translation) ->      
      if confirm translation
        $scope.uid = null
        $scope.password = null
        $cookieStore.remove("password")
        $cookieStore.remove("uid")
        # $state.go("wallet.common.dashboard")
        $state.go("wallet.common.transactions", {accountIndex: "accounts"})
        
        Wallet.logout() # Refreshes the browser, so won't return