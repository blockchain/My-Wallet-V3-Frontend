angular
  .module('walletApp')
  .controller("RecoveryCtrl", RecoveryCtrl);

function RecoveryCtrl($scope, Wallet, $state, $translate) {
  $scope.status = Wallet.status;
  $scope.isValidMnemonic = Wallet.isValidBIP39Mnemonic;

  $scope.recoveryPhrase = null;
  $scope.recoveryPassphrase = null;
  $scope.showRecoveryPhrase = false;
  $scope.editMnemonic = false;

  $scope.toggleRecoveryPhrase = () => {
    if (!$scope.showRecoveryPhrase) {
      const success = (mnemonic, passphrase) => {
        $scope.recoveryPhrase = mnemonic;
        $scope.recoveryPassphrase = passphrase;
        $scope.showRecoveryPhrase = true;
      };
      const error = (message) => {};
      Wallet.getMnemonic(success, error);
    } else {
      $scope.recoveryPhrase = null;
      $scope.recoveryPassphrase = null;
      $scope.showRecoveryPhrase = false;
    }
  };

  $scope.importRecoveryPhrase = () => {
    $scope.editMnemonic = true;
  };

  $scope.performImport = () => {
    const success = () => {
      $scope.importing = false;
      $scope.editMnemonic = false;
      $scope.mnemonic = null;
      $state.go("wallet.common.transactions", {
        accountIndex: ""
      });
      Wallet.displaySuccess("Successfully imported seed");
    };

    const error = (message) => {
      $scope.importing = false;
      Wallet.displayError(message);
    };

    const cancel = () => {
      $scope.importing = false;
    };

    if (confirm("You will lose all your bitcoins! Are you sure?")) {
      $scope.importing = true;
      Wallet.importWithMnemonic($scope.mnemonic, $scope.passphrase, success, error, cancel);
    }
  };

  $scope.doNotCopyPaste = (event) => {
    event.preventDefault();
    $translate("DO_NOT_COPY_PASTE").then((translation) => {
      Wallet.displayWarning(translation);
    });
  };

}
