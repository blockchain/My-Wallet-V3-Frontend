@SettingsAdvancedCtrl = ($scope, Wallet) ->
  $scope.settings = Wallet.settings
  
  $scope.enableBlockTOR = () ->
    Wallet.enableBlockTOR()
  
  $scope.disableBlockTOR = () ->
    Wallet.disableBlockTOR()