describe('SettingsSecurityCenterCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');

      Wallet.user = {
        mobileNumber: "+1234567890"
      };

      Wallet.changeEmail = (email, success, error) => success();

      Wallet.changePasswordHint = function (hint, success, error) {
        if (hint) {
          return success();
        }
      };

      scope = $rootScope.$new();

      scope.success = () => true;
      scope.error = () => true;

      $controller('SettingsSecurityCenterCtrl', {
        $scope: scope,
        $stateParams: {}
      }
      );

      scope.$digest();

    });

  });

  it('should have wallet settings', inject(Wallet => expect(scope.settings).toBe(Wallet.settings))
  );

  it('should have wallet user', inject(Wallet => expect(scope.user).toBe(Wallet.user))
  );

  it('should have wallet status', inject(Wallet => expect(scope.status).toBe(Wallet.status))
  );

  it('should toggle the current display', () => {
    scope.display.action = 'email';
    scope.toggle(scope.display.action);
    expect(scope.display.action).toBe(null);
  });

  it('should display the email field if editting', () => {
    scope.beginEditEmail();
    expect(scope.display.editingEmail).toBeTruthy();
  });

  it('should close the email editor field but not the display', () => {
    scope.cancelEditEmail();
    expect(scope.display.editingEmail).toBeFalsy();
    expect(scope.display.action).toBeTruthy();
  });

  it('should close the password hint field', () => {
    scope.cancelEditPasswordHint();
    expect(scope.display.action).toBe(null);
  });

  describe('changeEmail', () =>

    it('can change an email', () => scope.changeEmail('phil@blockchain.com', scope.success, scope.error))
  );

  describe('changePasswordHint', () =>

    it('can change password hints', () => {
      spyOn(Wallet, 'changePasswordHint');
      scope.changePasswordHint('phil', scope.success, scope.error);
      expect(Wallet.changePasswordHint).toHaveBeenCalled();
    })
  );

  it('should toggle state to securityphrase', inject(function ($timeout) {
    scope.promptBackup = true;
    $timeout.flush();
    expect(scope.display.action).toBe('securityphrase');
  })
  );

  describe('nextAction', () =>

    it('should toggle actions', () => {
      scope.user.isEmailVerified = true;
      scope.status.didConfirmRecoveryPhrase = false;

      scope.nextAction();
      expect(scope.display.action).toBe('securityphrase');

      scope.status.didConfirmRecoveryPhrase = true;
      scope.user.passwordHint = false;

      scope.nextAction();
      expect(scope.display.action).toBe('passwordhint');

      scope.status.didConfirmRecoveryPhrase = true;
      scope.user.passwordHint = true;
      scope.user.isMobileVerified = false;

      scope.nextAction();
      expect(scope.display.action).toBe('mobilenumber');

      scope.status.didConfirmRecoveryPhrase = true;
      scope.user.passwordHint = true;
      scope.user.isMobileVerified = true;
      scope.settings.needs2FA = false;

      scope.nextAction();
      expect(scope.display.action).toBe('twofactor');

      scope.status.didConfirmRecoveryPhrase = true;
      scope.user.passwordHint = true;
      scope.user.isMobileVerified = true;
      scope.settings.needs2FA = true;
      scope.settings.blockTOR = false;

      scope.nextAction();
      expect(scope.display.action).toBe('blocktor');
    })
  );
});
