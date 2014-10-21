@AppCtrl = ($scope, Wallet, $state, $rootScope) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $rootScope.isMock = Wallet.isMock

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->

  # First load:      
  $scope.didLoad()