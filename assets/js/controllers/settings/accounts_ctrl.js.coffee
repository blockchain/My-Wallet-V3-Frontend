@SettingsAccountsCtrl = ($scope, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form"
      controller: AccountFormCtrl
    )
    
  $scope.editAccount = (account) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form"
      controller: AccountFormCtrl
      resolve:
        account: -> account
    )