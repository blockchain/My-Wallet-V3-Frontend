@AccountsCtrl = ($scope, Wallet, $state,$stateParams, $modal, filterFilter) ->
  $scope.status    = Wallet.status
  $scope.total = Wallet.total
  $scope.settings = Wallet.settings
    
  $scope.numberOfActiveLegacyAddresses = () -> 
    return filterFilter(Wallet.legacyAddresses, {active: true}).length

  $scope.numberOfAccounts = () -> 
    return Wallet.accounts.length
  
  $scope.selectedAccountIndex = $stateParams.accountIndex
    
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> undefined
      windowClass: "blockchain-modal"
      
    )
    
  $scope.legacyTotal = () ->
    return Wallet.getTotalBalanceForActiveLegacyAddresses()

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts
    if $scope.numberOfAccounts() == 1
      location.assign '/#/0/transactions/'

  # First load:      
  $scope.didLoad()