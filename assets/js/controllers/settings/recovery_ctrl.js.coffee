@RecoveryCtrl = ($scope, Wallet, $state) ->
  $scope.recoveryPhrase = null
  $scope.showRecoveryPhrase = false
  $scope.didConfirmRecoveryPhrase = false
  $scope.editMnemonic = false
  $scope.mnemonic = null
  
  $scope.toggleRecoveryPhrase = () ->
    if !$scope.showRecoveryPhrase
      # wallet.my.getHDWalletPassphraseString(
      # Obtain second password from Wallet, if callback succesful:
      $scope.showRecoveryPhrase = true
    else
      $scope.recoveryPhrase = null
      $scope.showRecoveryPhrase = false    
    
  $scope.confirmRecoveryPhrase = () ->
    window.alert("Under construction")
    $scope.didConfirmRecoveryPhrase = true
    
  $scope.importRecoveryPhrase = () ->
    $scope.editMnemonic = true
    
  $scope.performImport = () ->
    
    success = () ->
      $scope.importing = false
      $scope.editMnemonic = false
      $scope.mnemonic = null
      $state.go("transactions", accountIndex: "accounts")
      Wallet.displaySuccess("Successfully imported seed")
      
    error = (message) ->
      $scope.importing = false
      Wallet.displayError(message)
      
    if confirm("You will lose all your bitcoins! Are you sure?")    
      $scope.importing = true
      Wallet.importWithMnemonic($scope.mnemonic, success, error)      
      
    return
    
    
  $scope.validate = () ->
    $scope.isValid = Wallet.isValidBIP39Mnemonic($scope.mnemonic)
    
  $scope.$watch "mnemonic", () ->
    $scope.validate()
  