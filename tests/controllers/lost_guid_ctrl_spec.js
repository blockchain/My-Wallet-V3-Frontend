describe('LostGuidCtrl', () => {
  let scope;
  let WalletNetwork;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $http) {
      let Wallet = $injector.get('Wallet');
      WalletNetwork = $injector.get('WalletNetwork');

      WalletNetwork.recoverGuid = (token, email, captcha) => ({
        then(callback) {
          if (captcha !== "") {
            callback();
          }
          return {
            catch(callback) {
              if (captcha === "") {
                return callback();
              }
            }
          };
        }
      }) ;

      WalletNetwork.getCaptchaImage = () => ({
        then(cb) {
          return cb({
            image: "captcha-image-blob",
            sessionToken: "token"
          });
        }
      }) ;

      window.URL = {
        createObjectURL(blob) {
          return blob + "_url";
        }
      };

      scope = $rootScope.$new();

      $controller('LostGuidCtrl', {
        $scope: scope,
        $stateParams: {}
      }
      );

    });

  });

  describe('on load', () => {
    beforeEach(() => scope.$digest());

    it('should refresh the captcha', () => pending());
      // This won't work:
      // expect(scope.refreshCaptcha).toHaveBeenCalled()
      // Possible workaround: http://stackoverflow.com/a/33605369

    it('should prefill uid if known', () => pending());
  });

  describe('refreshCaptcha()', () => {
    it('should update captchaSrc', inject(function () {
      scope.captchaSrc = undefined;
      scope.refreshCaptcha();
      expect(scope.captchaSrc).not.toBeUndefined();
    })
    );

    it('should reset the form field', () => {
      scope.fields.captcha = "12345";
      scope.refreshCaptcha();
      expect(scope.fields.captcha).toEqual("");
    });
  });

  describe('sendReminder()', () => {
    beforeEach(function () {
      spyOn(WalletNetwork, 'recoverGuid').and.callThrough();
      scope.form = {
        $setPristine() {},
        $setUntouched() {}
      };

      return scope.fields = {
        email: 'a@b.com',
        captcha: '1zabc'
      };
    });

    it('should call recoverGuid() with form data', () => {
      scope.sendReminder();
      expect(WalletNetwork.recoverGuid).toHaveBeenCalledWith("token", "a@b.com", "1zabc");
    });

    it('should go to the next step', () => {
      scope.sendReminder();
      expect(scope.currentStep).toEqual(2);
    });

    it('on failure should not go to the next step and refresh captch', () => {
      spyOn(scope, 'refreshCaptcha');
      scope.fields.captcha = "";

      scope.sendReminder();

      expect(scope.currentStep).toEqual(1);
      expect(scope.refreshCaptcha).toHaveBeenCalled();
    });
  });
});
