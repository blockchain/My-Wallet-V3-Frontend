describe('TwoFactorCtrl', () => {
  let scope;
  let Wallet;
  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      Wallet = $injector.get('Wallet');

      Wallet.user = {
        mobileNumber: "+1234567890"
      };

      Wallet.settings = {
        twoFactorMethod: null,
        needs2FA: false,
        googleAuthenticatorSecret: null
      };

      Wallet.settings_api = {
        unsetTwoFactor(success) {
          return success();
        },
        setTwoFactorGoogleAuthenticator(success) {
          return success("secret");
        },
        setTwoFactorYubiKey(code, success, error) {
          if (code === "wrong") {
            return error();
          } else {
            return success();
          }
        },
        setTwoFactorSMS(success) {
          return success();
        },
        confirmTwoFactorGoogleAuthenticator(code, success, error) {
          if (code === "wrong") {
            return error();
          } else {
            return success();
          }
        }
      };

      scope = $rootScope.$new();

      $controller('TwoFactorCtrl', {
        $scope: scope,
        $uibModalInstance: modalInstance
      }
      );

      scope.$apply();

    });

  });

  it('should exist',  () => expect(scope.close).toBeDefined());

  it('should go to step', () => {
    scope.goToStep('success');
    expect(scope.step).toBe('success');
  });

  it('should not go to the wrong step', () => {
    let initialStep = scope.step;
    scope.goToStep('invalid_step');
    expect(scope.step).toBe(initialStep);
  });

  it('should know the current step', () => expect(scope.isStep(scope.step)).toBe(true));

  describe('enable', () => {

    it('should start at step enable', () => expect(scope.step).toBe('enable'));

    describe('with SMS', () => {

      it('should try to configure mobile if needed', () => {
        scope.authWithPhone();
        expect(scope.step).toBe('configure_mobile');
      });

      it('should skip phone number input if phone number is saved', () => expect(scope.mobileNumber.step).toBe(2));

      it('should set 2FA to SMS if mobile is verified', () => {
        scope.user.isMobileVerified = true;
        scope.authWithPhone();
        expect(scope.settings.needs2FA).toBe(true);
        expect(scope.settings.twoFactorMethod).toBe(5);
      });
    });

    describe('with app', () => {
      beforeEach(() => scope.authWithApp());

      it('should be on step pair', () => expect(scope.step).toBe('pair'));

      it('should have google authenticator secret', () => expect(scope.settings.googleAuthenticatorSecret).toBeDefined());

      describe('YubiKey', () => {
        it('should pair correctly', () => {
          scope.fields.yubiKeyCode = '123456';
          scope.pairWithApp('yubiKey');
          expect(scope.settings.needs2FA).toBe(true);
          expect(scope.settings.twoFactorMethod).toBe(1);
          expect(scope.step).toBe('success');
        });

        it('should not pair if code is invalid', () => {
          spyOn(scope, 'setTwoFactorYubiKey');
          scope.pairWithApp('yubiKeyCode');
          expect(scope.setTwoFactorYubiKey).not.toHaveBeenCalled();
        });

        it('should not pair if code is wrong', () => {
          scope.fields.yubiKeyCode = 'wrong';
          scope.pairWithApp('yubiKey');
          expect(scope.settings.needs2FA).toBe(false);
          expect(scope.step).toBe('pair');
        });
      });

      describe('Google Authenticator', () => {

        it('should pair correctly', () => {
          scope.fields.authenticatorCode = '123456';
          scope.pairWithApp('authenticator');
          expect(scope.settings.needs2FA).toBe(true);
          expect(scope.settings.twoFactorMethod).toBe(4);
          expect(scope.step).toBe('success');
        });

        it('should not pair if code is invalid', () => {
          spyOn(scope, 'confirmTwoFactorGoogleAuthenticator');
          scope.fields.authenticatorCode = 'asdf';
          scope.pairWithApp('authenticator');
          expect(scope.confirmTwoFactorGoogleAuthenticator).not.toHaveBeenCalled();
        });

        it('should not pair if code is wrong', () => {
          scope.fields.authenticatorCode = 'wrong';
          scope.pairWithApp('authenticator');
          expect(scope.settings.needs2FA).toBe(false);
          expect(scope.step).toBe('pair');
        });
      });
    });
  });

  describe('disable', () => {
    beforeEach(() =>
      angular.mock.inject(function ($injector) {
        Wallet = $injector.get('Wallet');

        Wallet.settings.twoFactorMethod = 5;
        Wallet.settings.needs2FA = true;
      })
    );

    it('should start at step disable', () => {
      scope.step = scope.settings.needs2FA ? 'disable' : 'enable';
      expect(scope.step).toBe('disable');
    });

    it('should go to step disabled', () => {
      scope.disableTwoFactor();
      expect(scope.step).toBe('disabled');
    });

    it('should change twoFactorMethod to null', () => {
      scope.disableTwoFactor();
      expect(scope.settings.twoFactorMethod).toBe(null);
    });

    it('should change needs2FA to false', () => {
      scope.disableTwoFactor();
      expect(scope.settings.needs2FA).toBe(false);
    });
  });
});
