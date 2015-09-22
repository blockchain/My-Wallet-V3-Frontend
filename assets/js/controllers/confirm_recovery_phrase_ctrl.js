angular.module('walletApp').controller("ConfirmRecoveryPhraseCtrl", ($scope, $log, Wallet, $modalInstance, $translate) => {
  $scope.step = 1;
  $scope.recoveryPhrase = null;
  $scope.words = [
    {
      value: '',
      actual: '',
      index: null,
      error: null
    }, {
      value: '',
      actual: '',
      index: null,
      error: null
    }, {
      value: '',
      actual: '',
      index: null,
      error: null
    }, {
      value: '',
      actual: '',
      index: null,
      error: null
    }
  ];

  $scope.setRandomWords = recoveryPhrase => {
    let currentWordIndex = 0;
    let results = [];
    while (currentWordIndex < 4) {
      const randIndex = $scope.getRandInRange(0, 11);
      const randWord = recoveryPhrase.split(' ').splice(randIndex, 1).toString();
      if ($scope.hasWordBeenUsed(randIndex + 1)) {
        continue;
      }
      let word = $scope.words[currentWordIndex++];
      word.actual = randWord;
      word.index = randIndex + 1;
    }
  };

  $scope.hasWordBeenUsed = index => {
    return $scope.words.some(e => e.index === index);
  };

  $scope.getRandInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  $scope.close = () => {
    $modalInstance.dismiss("");
  };

  $scope.goToVerify = () => {
    $scope.step = 2;
  };

  $scope.verify = () => {
    let valid = true;
    for (let word of $scope.words) {
      word.error = word.value.toLowerCase() !== word.actual;
      if (word.error) valid = false;
    }
    if (valid) {
      Wallet.confirmRecoveryPhrase();
      $scope.step = 3;
    }
  };

  const success = mnemonic => {
    $scope.recoveryPhrase = mnemonic;
    $scope.setRandomWords(mnemonic);
  };

  const error = error => {
    $translate(error).then( translation => {
      Wallet.displayError(translation);
    });
    $modalInstance.dismiss("");
  };

  const cancel = () => {
    $modalInstance.dismiss("");
  };

  Wallet.getMnemonic(success, error, cancel);
});
