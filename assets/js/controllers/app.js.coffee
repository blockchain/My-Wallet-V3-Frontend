@AppCtrl = ($scope, Wallet, $state, $rootScope,$cookieStore, $timeout) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $rootScope.isMock = Wallet.isMock
  
  #################################
  #           Private             #
  #################################
    
  $scope.$watch "status.isLoggedIn", (newValue) ->
    if $state.current
      $scope.checkLogin()
  
  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->
    if toState != "login"
      $scope.checkLogin()
  )
  
  $scope.checkLogin = () ->    
    if $scope.status.isLoggedIn == false
      if $scope.savePassword && !!$cookieStore.get("password")  
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else 
        $state.go("login")
      
  $scope.didLoad = () ->
    $scope.checkLogin()
    
  $scope.didLoad()