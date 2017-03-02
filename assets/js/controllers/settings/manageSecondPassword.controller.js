angular
  .module('walletApp')
  .controller('ManageSecondPasswordCtrl', ManageSecondPasswordCtrl);

function ManageSecondPasswordCtrl ($rootScope, $scope, Wallet, $timeout, MyWallet, $uibModal, Alerts) {
  $scope.form = {};
  $scope.fields = {
    password: '',
    confirmation: ''
  };
  $scope.status = {
    waiting: false,
    removed: false
  };

  $scope.walletStatus = Wallet.status;
  $scope.isMainPassword = Wallet.isCorrectMainPassword;
  $scope.validateSecondPassword = Wallet.validateSecondPassword;

  $scope.userHasExchangeAcct = MyWallet.wallet.external &&
                               MyWallet.wallet.external.hasExchangeAccount;
  $scope.reset = () => {
    $scope.fields = {
      password: '',
      confirmation: ''
    };
  };

  $scope.removeSecondPassword = () => {
    if ($scope.status.waiting) return;
    $scope.status.waiting = true;
    $scope.$safeApply();

    let success = () => {
      Alerts.displaySuccess('SECOND_PASSWORD_REMOVE_SUCCESS', true);
      $scope.status.waiting = false;
      $scope.status.removed = true;
      $scope.deactivate();
    };
    let error = () => {
      Alerts.displayError('SECOND_PASSWORD_REMOVE_ERR');
      $scope.status.waiting = false;
      $scope.deactivate();
    };

    Wallet.removeSecondPassword($scope.fields.password, success, error);
    $rootScope.needsRefresh = true;
  };

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.setPassword = () => {
    if ($scope.status.waiting || $scope.form.$invalid) return;
    $scope.$safeApply();

    const success = () => {
      $scope.deactivate();
    };

    $scope.status.waiting = true;
    Wallet.setSecondPassword($scope.fields.password, success);
  };

  $scope.openRecovery = () => $uibModal.open({
    templateUrl: 'partials/confirm-recovery-phrase-modal.pug',
    controller: 'ConfirmRecoveryPhraseCtrl',
    windowClass: 'bc-modal'
  });

  $scope.recoveryModal = () => {
    const openModal = () => $uibModal.open({
      templateUrl: 'partials/recovery-before-second-password.pug',
      controller: 'ManageSecondPasswordCtrl',
      windowClass: 'bc-modal'
    });

    if (!Wallet.status.didConfirmRecoveryPhrase && !Wallet.settings.secondPassword) {
      openModal().result
      .then(() => {
        $scope.openRecovery();
      })
      .catch((e) => {
        if (e === 'backdrop click' || e === 'escape key press') return;
        $scope.active = true;
      });
    }
  };
}
