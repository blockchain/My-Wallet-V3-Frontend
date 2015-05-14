@AccountsCtrl = ($scope, Wallet, $state,$stateParams, $modal, filterFilter) ->
  $scope.status    = Wallet.status
  $scope.total = Wallet.total
  $scope.settings = Wallet.settings
    
  $scope.numberOfActiveLegacyAddresses = () -> 
    return filterFilter(Wallet.legacyAddresses, {active: true}).length
  
  $scope.selectedAccountIndex = $stateParams.accountIndex
    
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> undefined
      windowClass: "bc-modal"
      
    )
    
  $scope.legacyTotal = () ->
    return Wallet.getTotalBalanceForActiveLegacyAddresses()

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts

  # First load:      
  $scope.didLoad()
