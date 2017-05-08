describe('SettingsSecurityCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');

      Wallet.settings = {rememberTwoFactor: true};
      Wallet.user = {passwordHint: "Open sesame"};

      Wallet.settings_api = {
        updatePasswordHint1(hint, success, error) {
          if (hint === "आपकी पसंदीदा") {
            return error(101);
          } else {
            return success();
          }
        }
      };

      scope = $rootScope.$new();
      $controller('SettingsSecurityCtrl', {
        $scope: scope,
        $stateParams: {}
      }
      );
      return scope.$digest();
    })
  );

  it('should have access to wallet settings', () => expect(scope.settings).toBe(Wallet.settings));

  it('should have access to user object', () => expect(scope.user).toBe(Wallet.user));

  describe('remember 2FA', () => {
    it('has an initial status', () => expect(scope.settings.rememberTwoFactor).toBe(true));

    it('can be enabled', () => {
      spyOn(Wallet, 'enableRememberTwoFactor');
      scope.enableRememberTwoFactor();
      expect(Wallet.enableRememberTwoFactor).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      spyOn(Wallet, 'disableRememberTwoFactor');
      scope.disableRememberTwoFactor();
      expect(Wallet.disableRememberTwoFactor).toHaveBeenCalled();
    });
  });
});
