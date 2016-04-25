
angular
  .module('walletApp')
  .directive('configureSecondPassword', configureSecondPassword);

configureSecondPassword.$inject = ['$uibModal', 'Wallet'];

function configureSecondPassword ($uibModal, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/configure-second-password.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.settings = Wallet.settings;

    scope.removeSecondPassword = () => {
      if (scope.busy) return;
      scope.busy = true;
      let done = () => scope.busy = false;
      Wallet.removeSecondPassword(done, done);
    };

    scope.setSecondPassword = () => $uibModal.open({
      templateUrl: 'partials/settings/set-second-password.jade',
      controller: 'SetSecondPasswordCtrl',
      windowClass: 'bc-modal'
    });
  }
}
