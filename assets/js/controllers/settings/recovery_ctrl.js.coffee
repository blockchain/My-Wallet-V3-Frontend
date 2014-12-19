@RecoveryCtrl = ($scope, Wallet, $state) ->
  $scope.recoveryPhrase = Wallet.user.recoveryPhrase
  $scope.showRecoveryPhrase = false
  $scope.didConfirmRecoveryPhrase = false
  $scope.editMnemonic = false
  $scope.mnemonic = null
  
  $scope.toggleRecoveryPhrase = () ->
    $scope.showRecoveryPhrase = !$scope.showRecoveryPhrase
    
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
      $state.go("transactions", accountIndex: null)
      Wallet.displaySuccess("Successfully imported seed")
      
    error = (message) ->
      $scope.importing = false
      Wallet.displayError(message)
    
    $scope.importing = true
    
    Wallet.importWithMnemonic($scope.mnemonic, success, error)      
      
    return