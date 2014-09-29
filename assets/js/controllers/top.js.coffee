@TopCtrl = ($scope, Wallet) ->
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.totals = Wallet.totals
  
  # First load:      
  $scope.didLoad()