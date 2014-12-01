@SettingsAccountsCtrl = ($scope, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/new-account"
      controller: NewAccountCtrl
    )