
angular
  .module('walletApp')
  .directive('confirmRecoveryPhrase', confirmRecoveryPhrase);

confirmRecoveryPhrase.$inject = ['$uibModal', 'Wallet'];

function confirmRecoveryPhrase($uibModal, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      _buttonClass: '@buttonClass'
    },
    templateUrl: 'templates/confirm-recovery-phrase.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.status = Wallet.status;
    scope.buttonClass = scope._buttonClass || 'button-primary';

    scope.confirmRecoveryPhrase = () => $uibModal.open({
      templateUrl: 'partials/confirm-recovery-phrase-modal.jade',
      controller: 'ConfirmRecoveryPhraseCtrl',
      windowClass: 'bc-modal'
    });
  }
}
