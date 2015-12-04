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

  $scope.performImport = () => {
    $scope.working = true;

    const success = (wallet) => {
      $scope.working = false;
      $scope.nextStep();
      $rootScope.$safeApply();

      const loginSuccess = () => {
        Alerts.displaySuccess('Successfully recovered wallet!');
      };
      const loginError = (err) => {
        console.error(err);
      };
      $timeout(() => {
        $state.go('public.login');
        Wallet.login(
          wallet.guid, wallet.password, null, null, loginSuccess, loginError
        );
      }, 4000);
    };

    const error = (err) => {
      $scope.working = false;
      let message = err || $translate.instant('RECOVERY_ERROR');
      Alerts.displayError(message);
    };

    Wallet.my.recoverFromMnemonic(
      $scope.fields.email,
      $scope.fields.password,
      $scope.fields.mnemonic,
      $scope.fields.bip39phrase,
      success, error
    );
  };

  $scope.nextStep = () => {
    $scope.currentStep++;
    $scope.fields.confirmation = ""
  };

  $scope.goBack = () => {
    $scope.currentStep--;
  };

}
