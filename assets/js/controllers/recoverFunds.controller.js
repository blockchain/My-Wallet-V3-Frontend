angular
  .module('walletApp')
  .controller('RecoverFundsCtrl', RecoverFundsCtrl);

function RecoverFundsCtrl($scope, $rootScope, $state, $timeout, $translate, Wallet, Alerts) {
  $scope.isValidMnemonic = Wallet.isValidBIP39Mnemonic;
  $scope.currentStep = 1;
  $scope.fields = {
    email: '',
    password: '',
    confirmation: '',
    mnemonic: '',
    bip39phrase: ''
  };

  $scope.recover = () => {
    $scope.working = true;

    const success = (uid) => {

      const didLoginFinished = () => {
        $rootScope.beta = false;
        $scope.working = false;
        $scope.nextStep();

        $rootScope.$safeApply();

        $timeout(() => {
          $state.go("wallet.common.home");
          Alerts.displaySuccess('Successfully recovered wallet!');
        }, 4000);

      }

      Wallet.didLogin(uid, didLoginFinished);

    };

    const error = (err) => {
      $scope.working = false;
      let message = err || $translate.instant('RECOVERY_ERROR');
      Alerts.displayError(message);
    };

    Wallet.my.recoverResetPasswordAndLogin(
      $scope.fields.mnemonic,
      "", // BIP 39 password not yet supported in UI
      $scope.fields.email,
      $scope.fields.password,
      success,
      error
    );
  };

  $scope.nextStep = () => {
    $scope.currentStep++;
    $scope.fields.confirmation = "";
  };

  $scope.goBack = () => {
    $scope.currentStep--;
  };

}
