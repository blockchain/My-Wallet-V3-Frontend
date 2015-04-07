@SettingsNavigationCtrl = ($scope, Wallet, filterFilter) ->
  $scope.status    = Wallet.status
  $scope.settings  = Wallet.settings