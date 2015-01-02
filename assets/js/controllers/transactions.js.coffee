@TransactionsCtrl = ($scope, Wallet, MyWallet, $log, $stateParams, $timeout) ->
  
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "accounts", (newValue) ->
    if $scope.accounts.length > 0
      $scope.canDisplayDescriptions = true
    
  $scope.didLoad = () ->    
    $scope.transactions = Wallet.transactions      
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.totals = Wallet.totals  
    $scope.accountIndex = $stateParams.accountIndex
    $scope.accounts = Wallet.accounts
    $scope.canDisplayDescriptions = false # Don't try to show descriptions for before accounts have been loaded
        
  $scope.transactionFilter = (item) ->
    return item.to.account? || item.from.account? if $stateParams.accountIndex == "accounts"
    return !item.to.account? && !item.from.account? if $stateParams.accountIndex == "imported"
    return (item.to.account? && item.to.account.index == parseInt($stateParams.accountIndex)) || (item.from.account? && item.from.account.index == parseInt($stateParams.accountIndex))
  
  # First load:      
  $scope.didLoad()
  
