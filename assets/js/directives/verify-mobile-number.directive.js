
angular
  .module('walletDirectives')
  .directive('verifyMobileNumber', verifyMobileNumber);

function verifyMobileNumber ($translate, Wallet, $filter) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      onSuccess: '&'
    },
    templateUrl: 'templates/verify-mobile-number.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    if (attrs.buttonLg != null) scope.buttonLg = true;
    if (attrs.fullWidth != null) scope.fullWidth = true;

    scope.status = {
      busy: false,
      retrying: false,
      retrySuccess: false
    };
    scope.errors = {
      verify: null,
      retryFail: null
    };

    scope.retrySendCode = () => {
      scope.status.retrying = true;

      let success = () => {
        scope.status.retrying = false;
        scope.status.retrySuccess = true;
        scope.errors.retryFail = null;
      };

      let error = () => {
        scope.status.retrying = false;
        scope.status.retrySuccess = false;
        scope.errors.retryFail = 'Error resending verification code';
      };

      Wallet.changeMobile(Wallet.user.mobileNumber, success, error);
    };

    scope.verifyMobile = (code) => {
      scope.status.busy = true;

      let success = () => {
        scope.code = '';
        scope.errors.verify = '';
        scope.status.busy = false;
        scope.onSuccess();
      };

      let error = (message) => {
        scope.errors.verify = message;
        scope.status.busy = false;
      };

      Wallet.verifyMobile(code, success, error);
    };
  }
}
