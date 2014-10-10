@AccountsCtrl = ($scope, Wallet, $state) ->
  $scope.status    = Wallet.status
  $scope.totals = Wallet.totals
  $scope.settings = Wallet.settings
  
  $scope.createAccount = () ->
    Wallet.createAccount()

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts

  # First load:      
  $scope.didLoad()