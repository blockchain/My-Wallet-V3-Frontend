@TransactionsCtrl = ($scope, Wallet, $state, $cookieStore, $log) ->
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.transactions = Wallet.getTransactionsForAccount(0)
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.totals = Wallet.totals  
  
    # Restore after browser refresh (developer feature)
    if !$scope.status.isLoggedIn 
      if !!$cookieStore.get("password")
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else
        $state.go("dashboard")
  
  # First load:      
  $scope.didLoad()
  $log.info $scope.transactions