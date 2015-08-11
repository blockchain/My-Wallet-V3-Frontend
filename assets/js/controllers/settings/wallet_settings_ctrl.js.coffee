walletApp.controller "SettingsWalletCtrl", ($scope, Wallet, $translate, $window) -> 
  $scope.settings = Wallet.settings
  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
  $scope.btcCurrencies = Wallet.btcCurrencies
  $scope.uid = Wallet.user.uid
      
  $scope.$watch "settings.language", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeLanguage(newVal)
      
  $scope.$watch "settings.currency", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeCurrency(newVal)

  $scope.$watch "settings.btcCurrency", (newVal, oldVal) ->
    if oldVal? && newVal isnt oldVal
      Wallet.changeBTCCurrency(newVal)

  $scope.setHandleBitcoinLinks = () ->
    Wallet.handleBitcoinLinks()
    
  $scope.browserCanHandleBitcoinLinks = $window.navigator.registerProtocolHandler?
  
  #################################
  #           Private             #
  #################################