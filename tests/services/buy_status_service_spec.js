describe('buyStatus service', () => {
  let MyWallet;
  let MyWalletHelpers;
  let accountInfo;
  let buyStatus;
  let sfoxOptions;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    sfoxOptions = {
      countries: ['US']
    };

    module(($provide) => {
      $provide.value('Env', Promise.resolve({
        showBuySellTab: ['US'],
        partners: {
          coinify: {
            countries: ['NL']
          },
          sfox: sfoxOptions
        }
      }));
    });

    angular.mock.inject(function ($injector, _$rootScope_, _$q_) {
      MyWallet = $injector.get('MyWallet');
      MyWalletHelpers = $injector.get('MyWalletHelpers');

      accountInfo = {
        countryCodeGuess: 'US',
        invited: {
          coinify: false,
          sfox: false
        }
      };

      MyWalletHelpers.isStringHashInFraction = function (email, fraction) {
        if (email === 'a@b.com') {
          return fraction >= 0.98046875;
        } else if (email === 'a+16@b.com') {
          return fraction >= 0.0078125;
        } else {
          throw `Mock does not know sha256 hash of ${email}`;
        }
      };

      MyWallet.wallet = {
        accountInfo,
        hdwallet: {
          accounts: [{label: ""}, {label: "2nd account"}],
          defaultAccount: {index: 0}
        }
      };


      buyStatus = $injector.get('buyStatus');
    });
  });

  describe('canBuy', function () {
    it('should be false in a non-coinify country by default', done => expect(buyStatus.canBuy()).toBeResolvedWith(false, done));

    // Coinify has been rolled out to 100%. Invite functionality will be pruned
    // from backend, so e.g. get-info's 'invited' will no longer have a coinify flag.
    // JSON web token will always be signed.
    describe('in a Coinify country', function () {
      beforeEach(() => accountInfo.countryCodeGuess = 'NL');

      it('should be true regardless of what backend says', function (done) {
        accountInfo.countryCodeGuess = 'NL';
        accountInfo.invited.coinify = false;
        accountInfo.invited.sfox = false;

        expect(buyStatus.canBuy()).toBeResolvedWith(true, done);
      });
    });

    describe('in an SFOX country', function () {
      beforeEach(() => accountInfo.countryCodeGuess = 'US');

      it('should be false when user is not invited', done => expect(buyStatus.canBuy()).toBeResolvedWith(false, done));

      it('should be true when user is invited', function (done) {
        accountInfo.invited.sfox = true;
        expect(buyStatus.canBuy()).toBeResolvedWith(true, done);
      });

      it('should not be affected by coinify.invited', function (done) {
        accountInfo.invited.coinify = true; // This needs to be ignored, otherwise
                                           // we'd show the tab to everyone in the US
        accountInfo.invited.sfox = false;

        expect(buyStatus.canBuy()).toBeResolvedWith(false, done);
      });
    });
  });

  describe('showInviteForm()', function () {
    it('should not show if canBuy() is true', function (done) {
      spyOn(buyStatus, 'canBuy').and.callFake(() => Promise.resolve(true));
      expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(false, done);
    });

    it('canBuy should return false for these tests', done => expect(buyStatus.canBuy()).toBeResolvedWith(false, done));

    it('should not show for non-SFOX countries', done => expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(false, done));

    describe('in SFOX countries', function () {
      beforeEach(() => accountInfo.countryCodeGuess = 'US');

      it('should not show if inviteFormFraction field is missing in wallet-options', done => expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(false, done));

      it('should be shown to fraction of emails based on sha256 hash', function (done) {
        sfoxOptions.inviteFormFraction = 0.01; // 1%

        accountInfo.email = "a+16@b.com"; // requires > 0.0078% threshold
        expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(true, done);
      });

      it('should not show for non-SFOX countries, even if hash matches', function (done) {
        accountInfo.countryCodeGuess = 'NL';
        sfoxOptions.inviteFormFraction = 0.01; // 1%

        accountInfo.email = "a+16@b.com"; // requires > 0.0078% threshold

        expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(false, done);
      });

      it('should not be shown to remaining fraction of emails', function (done) {
        accountInfo.email = "a@b.com"; // requires >98% threshold
        expect(buyStatus.shouldShowInviteForm()).toBeResolvedWith(false, done);
      });
    });
  });
});
