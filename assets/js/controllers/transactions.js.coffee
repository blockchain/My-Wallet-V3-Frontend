@TransactionsCtrl = ($scope, Wallet, MyWallet, $state, $cookieStore, $log, $stateParams, $timeout) ->
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.transactions = Wallet.transactions      
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
        
    # Check if MyWallet is a mock or the real thing. The mock will simulate an 
    # incoming transaction after 3 seconds. 
    if MyWallet.mockShouldReceiveNewTransaction != undefined && $stateParams.accountIndex == "1"
      return if $scope.transactions.length == 0
      for transaction  in $scope.transactions
        if transaction.note == "Thanks for the tea"
          return

      $timeout((->
        MyWallet.mockShouldReceiveNewTransaction()
        ), 3000)
        
  $scope.transactionFilter = (item) ->
    return true if $stateParams.accountIndex == ""
    return item.to_account == parseInt($stateParams.accountIndex) || item.from_account == parseInt($stateParams.accountIndex)
  
  # First load:      
  $scope.didLoad()
  
