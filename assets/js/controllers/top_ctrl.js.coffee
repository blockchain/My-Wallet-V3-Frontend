walletApp.controller "TopCtrl", ($scope, Wallet, $stateParams) ->
  $scope.settings = Wallet.settings
  $scope.isBitCurrency = Wallet.isBitCurrency
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency

  $scope.getTotal = (index) -> Wallet.total(index)

  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.status = Wallet.status

    $scope.accountIndex = $stateParams.accountIndex

  # First load:
  $scope.didLoad()
