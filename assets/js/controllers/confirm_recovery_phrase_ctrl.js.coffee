walletApp.controller "ConfirmRecoveryPhraseCtrl", ($scope, $log, Wallet, $modalInstance) ->
  $scope.step = 1
  $scope.recoveryPhrase = null
  
  $scope.word1 = ""
  $scope.word2 = ""
  $scope.word6 = ""
  $scope.word8 = ""  
  
  $scope.errors = {word1: null, word2: null, word6: null, word8: null}
  
  success = (mnemonic) ->
    $scope.recoveryPhrase = mnemonic

  Wallet.getMnemonic(success)
  
  $scope.close = () ->
    $modalInstance.dismiss ""
    
  $scope.goToVerify = () -> 
    $scope.step = 2
  
  $scope.verify = () ->
    words = $scope.recoveryPhrase.split(" ")
    
    $scope.errors.word1 = words[0] != $scope.word1.toLowerCase()
    $scope.errors.word2 = words[1] != $scope.word2.toLowerCase()
    $scope.errors.word6 = words[5] != $scope.word6.toLowerCase()
    $scope.errors.word8 = words[7] != $scope.word8.toLowerCase()
        
    if $scope.errors.word1 == false && $scope.errors.word2 == false  && $scope.errors.word6 == false && $scope.errors.word8 == false
      Wallet.confirmRecoveryPhrase()
      $scope.step = 3
