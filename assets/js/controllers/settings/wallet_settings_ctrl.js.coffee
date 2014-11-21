@SettingsWalletCtrl = ($scope, Wallet, $translate, $window) -> 
  $scope.settings = Wallet.settings
  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
      
  $scope.$watch "settings.language", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeLanguage(newVal)
      
  $scope.$watch "settings.currency", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeCurrency(newVal)

  $scope.setHandleBitcoinLinks = () ->
    Wallet.handleBitcoinLinks()
    
  $scope.browserCanHandleBitcoinLinks = $window.navigator.registerProtocolHandler?
  
  #################################
  #           Private             #
  #################################