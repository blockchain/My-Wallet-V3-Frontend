
angular
  .module('walletApp')
  .directive('configureMobileNumber', configureMobileNumber);

configureMobileNumber.$inject = ['Wallet'];

function configureMobileNumber (Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      onCancel: '&',
      onSuccess: '&'
    },
    templateUrl: 'templates/configure-mobile-number.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.status = {
      busy: false,
      disableChangeBecause2FA: () => Wallet.settings.twoFactorMethod == 5
    };

    scope.fields = { newMobile: null };

    if (attrs.buttonLg) scope.buttonLg = true;
    if (attrs.fullWidth) scope.fullWidth = true;

    scope.fields.newMobile = Wallet.user.internationalMobileNumber;

    scope.numberChanged = () =>
      scope.fields.newMobile !== Wallet.user.internationalMobileNumber;

    scope.cancel = () => {
      scope.fields.newMobile = Wallet.user.internationalMobileNumber;
      scope.onCancel();
    };

    scope.changeMobile = () => {
      scope.status.busy = true;

      let success = () => {
        scope.status.busy = false;
        scope.onSuccess();
        Wallet.user.internationalMobileNumber = scope.fields.newMobile;
      };

      let error = () => {
        scope.status.busy = false;
      };

      let mobile = {
        country: scope.fields.newMobile.split(' ')[0],
        number: scope.fields.newMobile.split(' ').slice(1).join('')
      };
      Wallet.changeMobile(mobile, success, error);
    };
  }
}
