@AccountsCtrl = ($scope, Wallet, $state,$stateParams) ->
  $scope.status    = Wallet.status
  $scope.totals = Wallet.totals
  $scope.settings = Wallet.settings
  
  $scope.selectedAccountIndex = $stateParams.accountIndex
    
  $scope.createAccount = () ->
    Wallet.createAccount()
    $state.go("transactions", {accountIndex: Wallet.accounts.length - 1})

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts

  # First load:      
  $scope.didLoad()