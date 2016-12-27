angular
  .module('walletApp')
  .controller('RecoveryBeforeSecondPasswordCtrl', RecoveryBeforeSecondPasswordCtrl);

function RecoveryBeforeSecondPasswordCtrl ($scope, Wallet, MyWallet, $uibModal, $uibModalInstance) {
	console.log('recovery before 2nd controller here')

	$scope.testing = true;

	$scope.openRecoveryModal = () => {
		console.log('openRecoveryModal function running')
		$uibModalInstance.close('');
		$uibModal.open({
			templateUrl: 'partials/confirm-recovery-phrase-modal.jade',
      controller: 'ConfirmRecoveryPhraseCtrl',
      windowClass: 'bc-modal'
		});
	}
}  