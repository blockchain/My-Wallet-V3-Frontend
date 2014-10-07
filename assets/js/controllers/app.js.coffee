@AppCtrl = ($scope, Wallet, $state) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->

  # First load:      
  $scope.didLoad()