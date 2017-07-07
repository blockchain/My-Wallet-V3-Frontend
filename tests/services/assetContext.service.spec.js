describe('AssetContextService', () => {
  let $state;
  let assetContext;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => angular.mock.inject(($injector) => {
    $state = $injector.get('$state');
    assetContext = $injector.get('assetContext');
  }));

  // Aliases used for shorthand object notation
  let hasBtc = true;
  let hasEth = true;

  let configureState = ({ hasBtc = false, hasEth = false, viewing = 'home' }) => {
    $state.current = `wallet.common.${viewing}`;
    assetContext.hasBtcBalance = () => hasBtc;
    assetContext.hasEthBalance = () => hasEth;
  };

  describe('.getBalanceContext()', () => {
    describe('with BTC balance', () => {
      it('should see just btc if does not have ETH', () => {
        configureState({ hasBtc });
        expect(assetContext.getBalanceContext()).toEqual(['btc']);
      });

      it('should see just btc if does not have ETH and viewing /btc', () => {
        configureState({ hasBtc, viewing: 'btc' });
        expect(assetContext.getBalanceContext()).toEqual(['btc']);
      });

      it('should see both if has ETH', () => {
        configureState({ hasBtc, hasEth });
        expect(assetContext.getBalanceContext()).toEqual(['btc', 'eth']);
      });

      it('should see both if does not have ETH but viewing /eth', () => {
        configureState({ hasBtc, viewing: 'eth' });
        expect(assetContext.getBalanceContext()).toEqual(['btc', 'eth']);
      });
    });

    describe('with ETH balance', () => {
      it('should see just eth if does not have BTC', () => {
        configureState({ hasEth });
        expect(assetContext.getBalanceContext()).toEqual(['eth']);
      });

      it('should see just eth if does not have BTC and viewing /eth', () => {
        configureState({ hasEth, viewing: 'eth' });
        expect(assetContext.getBalanceContext()).toEqual(['eth']);
      });

      it('should see both if does not have BTC but viewing /btc', () => {
        configureState({ hasEth, viewing: 'btc' });
        expect(assetContext.getBalanceContext()).toEqual(['btc', 'eth']);
      });
    });

    describe('with no balance', () => {
      it('should see just btc', () => {
        configureState({});
        expect(assetContext.getBalanceContext()).toEqual(['btc']);
      });

      it('should see just btc if viewing /btc', () => {
        configureState({ viewing: 'btc' });
        expect(assetContext.getBalanceContext()).toEqual(['btc']);
      });

      it('should see both if viewing /eth', () => {
        configureState({ viewing: 'eth' });
        expect(assetContext.getBalanceContext()).toEqual(['btc', 'eth']);
      });
    });
  });
});
