angular
  .module('walletApp')
  .controller('RecoveryBeforeSecondPasswordCtrl', RecoveryBeforeSecondPasswordCtrl);

function RecoveryBeforeSecondPasswordCtrl (Wallet, $scope, $uibModal, $uibModalInstance) {
  $scope.openRecoveryModal = () => {
    $uibModalInstance.close('');
    $uibModal.open({
      templateUrl: 'partials/confirm-recovery-phrase-modal.jade',
      controller: 'ConfirmRecoveryPhraseCtrl',
      windowClass: 'bc-modal'
    });
  };

  $scope.setSecondPasswordAnyway = () => {
    Wallet.dismissedRecoveryPrompt();
    $uibModalInstance.close('');
  };
}
