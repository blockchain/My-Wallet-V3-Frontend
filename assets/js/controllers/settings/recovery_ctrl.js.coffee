@RecoveryCtrl = ($scope, Wallet) ->
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
    $scope.importing = true
    Wallet.importWithMnemonic($scope.mnemonic)