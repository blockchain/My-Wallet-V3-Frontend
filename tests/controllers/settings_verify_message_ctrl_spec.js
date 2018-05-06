describe('VerifyMessageController', () => {
  let scope;
  let MyWalletHelpers;
  
  beforeEach(angular.mock.module('walletDirectives'));

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      let MyWallet = $injector.get('MyWallet');
      MyWalletHelpers = $injector.get('MyWalletHelpers');

      MyWalletHelpers.isBitcoinAddress = a => a === 'bitcoin_address';
      MyWalletHelpers.isBase64 = s => s === 'base64';
      MyWalletHelpers.verifyMessage = (addr, sig, msg) => sig === 'valid_sig';

      let template = $templateCache.get('partials/settings/verify-message.pug');

      scope = $rootScope.$new();
      scope.model = {};
      $compile(template)(scope);
      scope.$digest();

      return $controller('VerifyMessageController', {$scope: scope});
    })
  );

  describe('form validation', () => {

    it('should only accept a valid bitcoin address', () => {
      scope.verifyMessageForm.address.$setViewValue('asdf');
      expect(scope.verifyMessageForm.address.$valid).toEqual(false);
      scope.verifyMessageForm.address.$setViewValue('bitcoin_address');
      expect(scope.verifyMessageForm.address.$valid).toEqual(true);
    });

    it('should only accept a base64 signature', () => {
      scope.verifyMessageForm.signature.$setViewValue('asdf');
      expect(scope.verifyMessageForm.signature.$valid).toEqual(false);
      scope.verifyMessageForm.signature.$setViewValue('base64');
      expect(scope.verifyMessageForm.signature.$valid).toEqual(true);
    });
  });

  describe('verify', () => {

    beforeEach(() => expect(scope.verified).not.toBeDefined());

    it('should fail with an incorrect signature', () => {
      scope.signature = 'invalid_sig';
      scope.verify();
      expect(scope.verified).toEqual(false);
    });

    it('should succeed with a correct signature', () => {
      scope.signature = 'valid_sig';
      scope.verify();
      expect(scope.verified).toEqual(true);
    });
  });
});
