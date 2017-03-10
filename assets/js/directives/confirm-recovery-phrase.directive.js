
angular
  .module('walletApp')
  .directive('confirmRecoveryPhrase', confirmRecoveryPhrase);

confirmRecoveryPhrase.$inject = ['$uibModal', 'Wallet', 'Alerts'];

function confirmRecoveryPhrase ($uibModal, Wallet, Alerts) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      promptBackup: '='
    },
    templateUrl: 'templates/confirm-recovery-phrase.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.confirmRecoveryPhrase = () => $uibModal.open({
      templateUrl: 'partials/confirm-recovery-phrase-modal.pug',
      controller: 'ConfirmRecoveryPhraseCtrl',
      windowClass: 'bc-modal'
    });

    if (scope.promptBackup) scope.confirmRecoveryPhrase();
  }
}
