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
    
    $scope.transaction = {} # {from_account: null, to_account: null, from_address: null, to_address: null}
    
    $scope.$watchCollection "transactions", (newVal) -> 
      transaction = $filter("getByProperty")("hash", $stateParams.hash, newVal)
      $scope.transaction = transaction
      
    $scope.$watch "transaction + accounts", () ->
      tx = $scope.transaction
      if tx? && tx.hash && $scope.accounts.length > 0
        console.log tx
        if tx.from.account?
          $scope.from = $scope.accounts[tx.from.account.index].label
        else
          if tx.from.legacyAddresses?
            address = $filter("getByProperty")("address", tx.from.legacyAddresses[0].address, Wallet.legacyAddresses)
            if address.label
              $scope.from = address.label
            else 
              $scope.from = address + " (you)"
          else if tx.from.externalAddresses?
            $scope.from = tx.from.externalAddresses.addressWithLargestOutput
        
        if tx.to.account?
          $scope.to = $scope.accounts[tx.to.account.index].label
        else
          if tx.to.legacyAddresses?
            address = $filter("getByProperty")("address", tx.to.legacyAddresses[0].address, Wallet.legacyAddresses)
            if address.label
              $scope.to = address.label
            else
              $scope.to = address + " (you)"
          else if tx.to.externalAddresses?
            $scope.to = tx.to.externalAddresses.addressWithLargestOutput
      
      
    # Restore after browser refresh (developer feature)
    if !$scope.status.isLoggedIn
      if !!$cookieStore.get("password")
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
      else
        # $state.go("dashboard")
        $state.go("transactions", {accountIndex: null})
        
  # First load:      
  $scope.didLoad()
  
