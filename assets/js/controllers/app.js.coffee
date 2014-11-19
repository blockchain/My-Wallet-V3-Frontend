@AppCtrl = ($scope, Wallet, $state, $rootScope,$cookieStore, $timeout) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $rootScope.isMock = Wallet.isMock
  
  #################################
  #           Private             #
  #################################
    
  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->
    if toState.name != "login"
      $scope.checkLogin()
  )
  
  $scope.checkLogin = () ->    
    if $scope.status.isLoggedIn == false
      console.log "Not logged in..."
      if $scope.savePassword && !!$cookieStore.get("password")  
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else 
        $state.go("login")