describe('cta', () => {
  let Wallet;
  let $injector;
  let localStorageService;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function (_$injector_) {
      $injector = _$injector_;
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      localStorageService = $injector.get('localStorageService');

      Wallet.total = () => 0;
      Wallet.status = {};
      Wallet.settings = {};
      Wallet.user = {};

      return MyWallet.wallet =
        {external: {}};}));

  let getService = function (cookies) {
    if (cookies == null) { cookies = {}; }
    for (let k in cookies) {
      let v = cookies[k];
      console.log(k);
      console.log(v);
      localStorageService.set(k, v);
    }
    spyOn(localStorageService, "set").and.callThrough();
    spyOn(localStorageService, "get").and.callThrough();
    return $injector.get('cta');
  };

  describe('.shouldShowBuyCta()', () => {
    it('should not show if the user has seen it', () => {
      let cta = getService({'buy-alert-seen': true});
      expect(cta.shouldShowBuyCta()).toEqual(false);
    });

    it('should show if the user has not seen it', () => {
      let cta = getService({'buy-alert-seen': false});
      expect(cta.shouldShowBuyCta()).toEqual(true);
    });
  });

  describe('.setBuyCtaDismissed()', () => {
    it('should set the buy-alert-seen cookie', () => {
      let cta = getService({'buy-alert-seen': undefined});
      cta.setBuyCtaDismissed();
      expect(localStorageService.set).toHaveBeenCalledWith("buy-alert-seen", true);
    });

    it('should reset the cookie jar', () => {
      let cta = getService({'buy-alert-seen': undefined});
      expect(cta.shouldShowBuyCta()).toEqual(true);
      localStorageService.get.and.returnValue(true);
      cta.setBuyCtaDismissed();
      expect(cta.shouldShowBuyCta()).toEqual(false);
    });
  });

  describe('.shouldShowSecurityWarning()', () => {
    let cta;
    beforeEach(function () {
      cta = getService({'contextual-message': { when: 1000 }});
      spyOn(cta, "shouldShowBuyCta").and.returnValue(false);
      spyOn(Date, "now").and.returnValue(1001);
      spyOn(Wallet, "total").and.returnValue(1);
      Wallet.status.didConfirmRecoveryPhrase = false;
      Wallet.status.needs2FA = false;
      return Wallet.user.isEmailVerified = false;
    });

    it("should show when no conditions are met", () => expect(cta.shouldShowSecurityWarning()).toBe(true));

    it('should not show when all conditions are met', () => {
      Wallet.status.didConfirmRecoveryPhrase = true;
      Wallet.status.needs2FA = true;
      expect(cta.shouldShowSecurityWarning()).toBe(true);
    });

    it('should not show when it is not time', () => {
      Date.now.and.returnValue(999);
      expect(cta.shouldShowSecurityWarning()).toBe(false);
    });

    it('should not show when balance is 0', () => {
      Wallet.total.and.returnValue(0);
      expect(cta.shouldShowSecurityWarning()).toBe(false);
    });

    it('should show when recovery phrase is not backed up', () => {
      Wallet.status.didConfirmRecoveryPhrase = false;
      Wallet.status.needs2FA = true;
      Wallet.user.isEmailVerified = true;
      expect(cta.shouldShowSecurityWarning()).toBe(true);
    });

    it('should show when email is not verified or 2FA is not on', () => {
      Wallet.status.didConfirmRecoveryPhrase = true;
      Wallet.status.needs2FA = false;
      Wallet.user.isEmailVerified = false;
      expect(cta.shouldShowSecurityWarning()).toBe(true);
    });

    it('should now show if the buy cta is showing', () => {
      cta.shouldShowBuyCta.and.returnValue(true);
      expect(cta.shouldShowSecurityWarning()).toBe(false);
    });
  });

  describe('.setSecurityWarningDismissed()', () => {
    beforeEach(() => spyOn(Date, "now").and.returnValue(1001));

    it('should set the contextual-message cookie', () => {
      let cta = getService({'contextual-message': { when: 1000, index: 0 }});
      cta.setSecurityWarningDismissed();
      expect(localStorageService.set).toHaveBeenCalledWith("contextual-message", { index: 1, when: 604801001 });
    });
  });

  describe('.getSecurityWarningMessage()', () => {
    it('should get the correct message for message index 0', () => {
      let cta = getService({'contextual-message': { when: 1000, index: 0 }});
      let message = cta.getSecurityWarningMessage();
      expect(message).toEqual("SECURE_WALLET_MSG_1");
    });

    it('should get the correct message for message index 1', () => {
      let cta = getService({'contextual-message': { when: 1000, index: 1 }});
      let message = cta.getSecurityWarningMessage();
      expect(message).toEqual("SECURE_WALLET_MSG_2");
    });
  });
});
