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
    currentWordIndex = 0
    while currentWordIndex < 4
      randIndex = $scope.getRandInRange(0, 11)
      randWord = recoveryPhrase.split(' ').splice(randIndex, 1).toString()

      continue if $scope.hasWordBeenUsed(randIndex + 1)

      word = $scope.words[currentWordIndex++]
      word.actual = randWord
      word.index = randIndex + 1

  $scope.hasWordBeenUsed = (index) ->
    for word in $scope.words
      return true if word.index == index
    return false

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

  success = (mnemonic) ->
    $scope.recoveryPhrase = mnemonic
    $scope.setRandomWords(mnemonic)

  error = (error) ->
    $translate(error).then (translation) ->
      Wallet.displayError(translation)
    $modalInstance.dismiss ""

  cancel = () ->
    $modalInstance.dismiss ""

  Wallet.getMnemonic(success, error, cancel)
