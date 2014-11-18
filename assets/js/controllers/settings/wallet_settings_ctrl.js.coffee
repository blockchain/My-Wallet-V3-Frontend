@SettingsWalletCtrl = ($scope, Wallet, $translate) -> 
  $scope.settings = Wallet.settings
  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
    
  $scope.edit = {twoFactor: false} 
  
    
  $scope.$watch "settings.language", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeLanguage(newVal)
      
  $scope.$watch "settings.currency", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeCurrency(newVal)
      
  $scope.disableSecondFactor = () ->
    return false unless $scope.settings.needs2FA
    
    $translate("CONFIRM_DISABLE_2FA").then (translation) ->
      if confirm translation
        Wallet.disableSecondFactor()
  
  #################################
  #           Private             #
  #################################