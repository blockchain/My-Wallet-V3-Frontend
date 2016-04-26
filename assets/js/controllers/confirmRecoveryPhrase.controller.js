angular
  .module('walletApp')
  .controller('ConfirmRecoveryPhraseCtrl', ConfirmRecoveryPhraseCtrl);

function ConfirmRecoveryPhraseCtrl ($scope, $log, Wallet, Alerts, $uibModalInstance, $translate) {
  $scope.step = 0;
  $scope.offset = 0;
  $scope.recoveryPhrase = null;

  $scope.lastWordGroup = false;

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
    $uibModalInstance.dismiss('');
  };

  $scope.goToVerify = () => {
    $scope.step = 2;
  };

  $scope.goToShow = () => {
    $scope.step = 1;

    if ($scope.mnemonic == null) {
      const success = mnemonic => {
        $scope.recoveryPhrase = mnemonic.split(' ');
        $scope.setRandomWords(mnemonic);
      };

      const error = error => {
        Alerts.displayError(error);
        $uibModalInstance.dismiss('');
      };

      const cancel = () => {
        $uibModalInstance.dismiss('');
      };

      Wallet.getMnemonic(success, error, cancel);
    }
  };

  $scope.hasEmptyWords = () => $scope.words.some((word) => word.value === '');

  $scope.nextWords = () => {
    if ($scope.offset >= 8) return;
    $scope.offset += 4;
    if ($scope.offset === 8) $scope.lastWordGroup = true;
  };

  $scope.previousWords = () => {
    if ($scope.offset <= 0) return;
    $scope.offset -= 4;
    $scope.lastWordGroup = false;
  };

  $scope.previousStep = () => {
    $scope.step -= 1;
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
}
