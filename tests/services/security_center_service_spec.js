describe('securityCenterServices', () => {
  let Wallet;
  let SecurityCenter;
  let rootScope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, _$rootScope_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
      Wallet = $injector.get('Wallet');
      SecurityCenter = $injector.get('SecurityCenter');
      rootScope = _$rootScope_;

      spyOn(Wallet, 'monitor').and.callThrough();

      Wallet.user.isEmailVerified = false;
      Wallet.status.didConfirmRecoveryPhrase = false;
      Wallet.user.passwordHint = '';
      Wallet.settings.needs2FA = false;
      Wallet.user.isMobileVerified = 0;
      Wallet.settings.blockTOR = false;

      rootScope.$digest();
    });
  });

  describe('level', () => {

    it('should start at 0', () => expect(SecurityCenter.security.level).toBe(0));

    it('should increase if email has been verified', () => {
      Wallet.user.isEmailVerified = true;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should increase if recovery phrase has been confirmed', () => {
      Wallet.status.didConfirmRecoveryPhrase = true;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should increase if user has a password hint', () => {
      Wallet.user.passwordHint = 'Password hint';
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should increase if 2FA is set', () => {
      Wallet.settings.needs2FA = true;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should increase if mobile has been verified', () => {
      Wallet.user.isMobileVerified = 1;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should increase if user has blocked Tor', () => {
      Wallet.settings.blockTOR = true;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(1);
    });

    it('should be at 6 if all security objectives are complete', () => {
      Wallet.user.isEmailVerified = true;
      Wallet.status.didConfirmRecoveryPhrase = true;
      Wallet.user.passwordHint = 'Password hint';
      Wallet.settings.needs2FA = true;
      Wallet.user.isMobileVerified = 1;
      Wallet.settings.blockTOR = true;
      rootScope.$digest();
      expect(SecurityCenter.security.level).toBe(6);
    });
  });
});
