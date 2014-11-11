@RecoveryCtrl = ($scope, Wallet) ->
  $scope.recoveryPhrase = Wallet.user.recoveryPhrase
  $scope.showRecoveryPhrase = false
  $scope.didConfirmRecoveryPhrase = false
  
  $scope.toggleRecoveryPhrase = () ->
    $scope.showRecoveryPhrase = !$scope.showRecoveryPhrase
    
  $scope.confirmRecoveryPhrase = () ->
    window.alert("Under construction")
    $scope.didConfirmRecoveryPhrase = true
    
  $scope.importRecoveryPhrase = () ->
    window.alert("Under construction")