walletApp.controller "ConfirmRecoveryPhraseCtrl", ($scope, $log, Wallet, $modalInstance, $translate) ->
  $scope.step = 1
  $scope.recoveryPhrase = null

  $scope.words = [
    {value: '', actual: '', index: null, error: null}
    {value: '', actual: '', index: null, error: null}
    {value: '', actual: '', index: null, error: null}
    {value: '', actual: '', index: null, error: null}
  ]

  $scope.setRandomWords = (recoveryPhrase) ->
    words = recoveryPhrase.split(' ')
    for word in $scope.words
      randIndex = $scope.getRandInRange(0, words.length - 1)
      randWord = words.splice(randIndex, 1).toString()
      word.actual = randWord
      word.index = recoveryPhrase.split(' ').indexOf(randWord) + 1

  $scope.getRandInRange = (min, max) ->
    return Math.floor(Math.random() * (max - min + 1) + min)

  $scope.close = () ->
    $modalInstance.dismiss ""

  $scope.goToVerify = () ->
    $scope.step = 2

  $scope.verify = () ->
    valid = true

    for word in $scope.words
      word.error = word.value.toLowerCase() != word.actual
      if word.error
        valid = false

    if valid
      Wallet.confirmRecoveryPhrase()
      $scope.step = 3

  Wallet.getMnemonic (mnemonic) ->
    $scope.recoveryPhrase = mnemonic
    $scope.setRandomWords(mnemonic)
  , (error) ->
    $translate(error).then (translation) ->
      Wallet.displayError(translation)
    $scope.close()
