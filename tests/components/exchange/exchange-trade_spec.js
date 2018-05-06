describe('exchange-trade.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let scope;
  let Wallet;

  let getTrades = () => [
    {
      id: 1,
      amount: 100,
      subscriptionId: 1,
      fiatAmount: 75
    },
    {
      id: 2,
      amount: 200,
      subscriptionId: 2,
      fiatAmount: 275
    }
  ];

  let handlers = {
    namespace: 'coinify',
    viewDetails () { return true; },
    exTrade: getTrades()[0]
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('exchangeTrade', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/trade.pug');
    $compile(template)(scope);
    return scope;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});

      MyWallet.wallet.external = {
        sfox: {
          profile: {}
        }
      };
    }));

  it('should set trade to exTrade', () => {
    scope = getControllerScope(handlers);
    expect(scope.$ctrl.trade).toBe(scope.$ctrl.exTrade);
  });

  describe('.getClass()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should return state-danger-text if trade is failed', () => {
      scope.$ctrl.trade = { isFailed: true };
      expect(scope.$ctrl.getClass()).toBe('state-danger-text');
    });

    it('should return success if trade is complete', () => {
      scope.$ctrl.trade = { isComplete: true };
      expect(scope.$ctrl.getClass()).toBe('success');
    });

    it('should return medium-blue if trade is processing', () => {
      scope.$ctrl.trade = { isProcessing: true };
      expect(scope.$ctrl.getClass()).toBe('medium-blue');
    });
  });
});
