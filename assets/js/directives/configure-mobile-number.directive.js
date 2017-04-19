
angular
  .module('walletApp')
  .directive('configureMobileNumber', configureMobileNumber);

configureMobileNumber.$inject = ['Wallet', 'bcPhoneNumber'];

function configureMobileNumber (Wallet, bcPhoneNumber) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      onCancel: '&',
      onSuccess: '&'
    },
    templateUrl: 'templates/configure-mobile-number.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.status = {
      busy: false,
      disableChangeBecause2FA: () => parseInt(Wallet.settings.twoFactorMethod, 10) === 5
    };

    scope.fields = { newMobile: null };

    if (attrs.buttonLg) scope.buttonLg = true;
    if (attrs.fullWidth) scope.fullWidth = true;

    scope.numberChanged = () =>
      scope.fields.newMobile !== scope.previousNumber;

    scope.cancel = () => {
      scope.fields.newMobile = scope.previousNumber;
      scope.onCancel();
    };

    scope.changeMobile = () => {
      scope.status.busy = true;

      let success = () => {
        scope.status.busy = false;
        scope.onSuccess();
        Wallet.user.mobileNumber = scope.fields.newMobile;
      };

      let error = () => {
        scope.status.busy = false;
      };

      Wallet.changeMobile(scope.fields.newMobile.split('-').join(''), success, error);
    };

    scope.$watch(() => Wallet.user.mobileNumber, () => {
      scope.previousNumber = bcPhoneNumber.format(Wallet.user.mobileNumber);
      scope.fields.newMobile = scope.previousNumber;
    });
  }
}
