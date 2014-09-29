@NavigationCtrl = ($scope, Wallet, $modal) ->
  
  $scope.account = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/account"
      controller: AccountCtrl
    )
  
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()
  
  