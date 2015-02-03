@RecoveryCtrl = ($scope, Wallet, $state, $translate) ->
  $scope.recoveryPhrase = null
  $scope.showRecoveryPhrase = false
  $scope.editMnemonic = false
  $scope.status = Wallet.status
  
  $scope.toggleRecoveryPhrase = () ->
    if !$scope.showRecoveryPhrase
      success = (mnemonic) ->
        $scope.recoveryPhrase = mnemonic
        $scope.showRecoveryPhrase = true
      Wallet.getMnemonic(success)
    else
      $scope.recoveryPhrase = null
      $scope.showRecoveryPhrase = false    
    
  $scope.importRecoveryPhrase = () ->
    $scope.editMnemonic = true
    
  $scope.performImport = () ->
    
    success = () ->
      $scope.importing = false
      $scope.editMnemonic = false
      $scope.mnemonic = null
      $state.go("wallet.common.transactions", accountIndex: "accounts")
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
    
  $scope.doNotCopyPaste = (event) ->
    event.preventDefault()
    $translate("DO_NOT_COPY_PASTE").then (translation) ->
      Wallet.displayWarning translation
  