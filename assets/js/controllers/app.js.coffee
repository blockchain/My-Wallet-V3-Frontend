@AppCtrl = ($scope, Wallet, $state, $rootScope,$cookieStore) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $rootScope.isMock = Wallet.isMock

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    if $scope.savePassword && !$scope.status.isLoggedIn && !!$cookieStore.get("password")
      Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))

  # First load:      
  $scope.didLoad()