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
    $state.current = { name: `wallet.common.${viewing}` };
    assetContext.hasBtcBalance = () => hasBtc;
    assetContext.hasEthBalance = () => hasEth;
  };
});
