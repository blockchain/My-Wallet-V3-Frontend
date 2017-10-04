describe('unocoin service', () => {
  let MyWallet;
  let unocoin;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Env', Promise.resolve({
        showBuySellTab: ['US'],
        partners: {
          coinify: { countries: ['US'] }
        }
      }));
    });

    angular.mock.inject(function ($injector, _$rootScope_, _$q_) {
      MyWallet = $injector.get('MyWallet');
      unocoin = $injector.get('unocoin');

      MyWallet.wallet = {
        accountInfo: {
          countryCodeGuess: {}
        },
        hdwallet: {
          accounts: [{label: ''}, {label: '2nd account'}],
          defaultAccount: {index: 0}
        },
        external: {
          unocoin: { profile: null }
        }
      };
    });
  });

  describe('.determineStep', () => {
    describe('without an account', () => {
      it('should return create', () => {
        let step = unocoin.determineStep();
        expect(step).toBe('create');
      });
    });

    describe('with an account', () => {
      describe('incomplete', () => {
        it('should return verify', () => {
          MyWallet.wallet.external.unocoin.profile = { level: 1 };
          let step = unocoin.determineStep();
          expect(step).toBe('verify');
        });
      });

      describe('identity and bank info complete', () => {
        it('should return upload', () => {
          MyWallet.wallet.external.unocoin.profile = { level: 1, identityComplete: true, bankInfoComplete: true };
          let step = unocoin.determineStep();
          expect(step).toBe('upload');
        });
      });
    });

    describe('info uploaded', () => {
      it('should return pending', () => {
        MyWallet.wallet.external.unocoin.profile = { level: 2, identityComplete: true, bankInfoComplete: true };
        let step = unocoin.determineStep();
        expect(step).toBe('pending');
      });
    });
  });

  describe('.verificationRequired', () => {
    it('should return a boolean', () => {
      let profile = { level: 1 };
      expect(unocoin.verificationRequired(profile)).toBe(true);
    });
  });
});
