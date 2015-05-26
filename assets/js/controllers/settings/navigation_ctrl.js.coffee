@SettingsNavigationCtrl = ($scope, Wallet, filterFilter, $state) ->
  $scope.status    = Wallet.status
  $scope.settings  = Wallet.settings

  $scope.goHome = () ->
    $state.go("wallet.common.dashboard")
