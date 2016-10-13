angular
  .module('walletApp')
  .controller('ConfirmRecoveryPhraseCtrl', ConfirmRecoveryPhraseCtrl);

function ConfirmRecoveryPhraseCtrl ($scope, $uibModalInstance, Wallet, Alerts, modals) {
  $scope.step = 0;
  $scope.offset = 0;
  $scope.recoveryPhrase = [];
  $scope.words = [...Array(4)].map(_ => ({}));
  $scope.addresses = Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);
  $scope.shouldTransfer = $scope.addresses.reduce((sum, a) => sum + a.balance, 0) > 0;

  $scope.setRandomWords = () => {
    let currentWordIndex = 0;
    while (currentWordIndex < 4) {
      const randIndex = $scope.getRandInRange(0, 11);
      const randWord = $scope.recoveryPhrase.slice(randIndex)[0];
      if ($scope.hasWordBeenUsed(randIndex + 1)) { continue; }
      let word = $scope.words[currentWordIndex++];
      word.actual = randWord;
      word.index = randIndex + 1;
    }
  };

  $scope.hasWordBeenUsed = (index) => (
    $scope.words.some(e => e.index === index)
  );

  $scope.getRandInRange = (min, max) => (
    Math.floor(Math.random() * (max - min + 1) + min)
  );

  $scope.hasEmptyWords = () => (
    $scope.words.some(word => word.value === '')
  );

  $scope.goToShow = () => {
    $scope.step = 1;

    let success = (mnemonic) => {
      $scope.recoveryPhrase = mnemonic.split(' ');
      $scope.setRandomWords();
    };

    let error = (error) => {
      Alerts.displayError(error);
      $scope.close();
    };

    Wallet.getMnemonic(success, error, $scope.close);
  };

  $scope.verify = () => {
    let valid = true;
    for (let word of $scope.words) {
      word.error = word.value.toLowerCase() !== word.actual;
      if (word.error) valid = false;
    }
    if (valid) {
      Wallet.confirmRecoveryPhrase();
      $scope.step = $scope.shouldTransfer ? 4 : 3;
    }
  };

  $scope.openTransferAll = () => {
    $scope.close();
    modals.openTransfer($scope.addresses);
  };

  $scope.close = () => { $uibModalInstance.dismiss(''); };

  $scope.previousStep = () => { $scope.step -= 1; };

  $scope.goToVerify = () => { $scope.step = 2; };

  $scope.nextWords = () => { $scope.offset += 4; };

  $scope.previousWords = () => { $scope.offset -= 4; };
}
