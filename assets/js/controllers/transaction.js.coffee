@TransactionCtrl = ($scope, Wallet, $log, $state, $stateParams, $filter, $cookieStore) ->
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.accountIndex = $stateParams.accountIndex
    
    $scope.transactions = Wallet.transactions
    $scope.accounts = Wallet.accounts
    
    $scope.from = ""
    $scope.to = ""
    
    $scope.transaction = {from_account: null, to_account: null, from_address: null, to_address: null}
    
    $scope.$watchCollection "transactions", (newVal) -> 
      transaction = $filter("getByProperty")("hash", $stateParams.hash, newVal)
      $scope.transaction = transaction 
      
    $scope.$watch "transaction + accounts", () ->
      tx = $scope.transaction
      if tx? && $scope.accounts.length > 0
        if tx.from_account?
          $scope.from = $scope.accounts[tx.from_account].label
        else
          $scope.from = tx.from_addresses.join(", ")
        
        if tx.to_account?
          $scope.to = Wallet.accounts[tx.to_account].label
        else
          $scope.to = tx.to_addresses.join(", ")
      
      
    # Restore after browser refresh (developer feature)
    if !$scope.status.isLoggedIn
      if !!$cookieStore.get("password")
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else
        $state.go("dashboard")
        
  # First load:      
  $scope.didLoad()
  
