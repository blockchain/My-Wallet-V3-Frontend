@NavigationCtrl = ($scope, Wallet, MyWallet, $modal) ->
  
  $scope.account = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/account"
      controller: AccountCtrl
    )
    
  # Check if MyWallet is a mock or the real thing. The mock will simulate an 
  # incoming transaction after 5 seconds. Refactor if this breaks any of the
  # navigation controller spects.
  if MyWallet.mockSpontanuousBehavior != undefined
    MyWallet.mockSpontanuousBehavior()
  
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
  
  # First load:      
  $scope.didLoad()
  
  