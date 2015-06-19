walletApp.controller "TopCtrl", ($scope, Wallet, $stateParams) ->
  $scope.settings = Wallet.settings
  $scope.isBitCurrency = Wallet.isBitCurrency
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency
  

  
  $scope.getTotal = (index) ->
    return null if $scope.total(index) == null
    if not $scope.settings.multiAccount 
      return null if $scope.total('imported') == null
      return $scope.total('imported') + $scope.total(index)
    return $scope.total(index)
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total = Wallet.total
    
    $scope.accountIndex = $stateParams.accountIndex

  # First load:      
  $scope.didLoad()
