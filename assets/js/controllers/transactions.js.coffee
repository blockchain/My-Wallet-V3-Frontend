@TransactionsCtrl = ($scope, Wallet, $state, $cookies, $log) ->
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts
    $scope.transactions = Wallet.transactions
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.totals = Wallet.totals  
  
    # Restore after browser refresh
    if !$scope.status.isLoggedIn 
      if !!$cookies.password
        # TODO: don't use the password to restore a session
        Wallet.login($cookies.uid, $cookies.password)
      else
        $state.go("dashboard")
  
  # First load:      
  $scope.didLoad()