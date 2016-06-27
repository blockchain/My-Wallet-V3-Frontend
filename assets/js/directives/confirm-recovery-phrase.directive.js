
angular
  .module('walletApp')
  .directive('confirmRecoveryPhrase', confirmRecoveryPhrase);

confirmRecoveryPhrase.$inject = ['$uibModal', 'Wallet'];

function confirmRecoveryPhrase ($uibModal, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/confirm-recovery-phrase.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.confirmRecoveryPhrase = () => $uibModal.open({
      templateUrl: 'partials/confirm-recovery-phrase-modal.jade',
      controller: 'ConfirmRecoveryPhraseCtrl',
      windowClass: 'bc-modal'
    });
  }
}
