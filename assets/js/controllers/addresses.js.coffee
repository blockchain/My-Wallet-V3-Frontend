@AddressesCtrl = ($scope, Wallet, $state) ->
  $scope.status    = Wallet.status
  $scope.totals = Wallet.totals
  
  $scope.generateAddress = () ->
    Wallet.generateAddress()

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.addresses = Wallet.addresses

  # First load:      
  $scope.didLoad()