
angular
  .module('walletApp')
  .directive('resendEmailConfirmation', resendEmailConfirmation);

function resendEmailConfirmation ($translate, Wallet) {
  const directive = {
    restrict: 'E',
    replace: 'true',
    scope: {},
    templateUrl: 'templates/resend-email-confirmation.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.status = {
      loading: null,
      done: null
    };

    scope.user = Wallet.user;

    scope.resendEmailConfirmation = () => {
      if (!scope.loading && !scope.done) {
        scope.status.loading = true;
        scope.status.done = false;

        var success = () => {
          scope.status.loading = false;
          scope.status.done = true;
        };

        var error = () => {
          scope.status.loading = false;
        };

        Wallet.resendEmailConfirmation(success, error);
      }
    };
  }
}
