@AddressesCtrl = ($scope, Wallet, $state) ->
  $scope.status    = Wallet.status
  $scope.totals = Wallet.totals
  $scope.settings = Wallet.settings
  
  $scope.generateAddress = () ->
    Wallet.generateAddress()

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.addresses = Wallet.addresses

  # First load:      
  $scope.didLoad()