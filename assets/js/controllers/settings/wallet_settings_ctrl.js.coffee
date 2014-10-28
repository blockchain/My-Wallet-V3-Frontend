@SettingsWalletCtrl = ($scope, Wallet) -> 
  $scope.settings = Wallet.settings
  $scope.languages = Wallet.languages
    
  $scope.$watch "settings.language", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeLanguage(newVal)
  
  #################################
  #           Private             #
  #################################