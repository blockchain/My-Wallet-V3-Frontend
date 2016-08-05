
angular
  .module('walletApp')
  .directive('confirmRecoveryPhrase', confirmRecoveryPhrase);

confirmRecoveryPhrase.$inject = ['$uibModal', 'Wallet', 'Alerts'];

function confirmRecoveryPhrase ($uibModal, Wallet, Alerts) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/confirm-recovery-phrase.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.confirmRecoveryPhrase = () => {
      let openModal = () => $uibModal.open({
        templateUrl: 'partials/confirm-recovery-phrase-modal.jade',
        controller: 'ConfirmRecoveryPhraseCtrl',
        windowClass: 'bc-modal'
      });
      let validatePw = (result) => {
        if (Wallet.isCorrectMainPassword(result)) {
          openModal();
        } else {
          Alerts.displayError('INCORRECT_PASSWORD');
          scope.confirmRecoveryPhrase();
        }
      };
      Wallet.settings.secondPassword
        ? openModal()
        : Alerts.prompt('MAIN_PW_REQUIRED', { type: 'password' }).then(validatePw);
    };
  }
}
