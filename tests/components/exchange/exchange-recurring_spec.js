describe('exchange-recurring.component', () => {
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
    buy () { return true; },
    subscription: 1,
    partnerService: 'coinify',
    frequency: 'weekly',
    recurringBuyLimit () { return 100; },
    trade () { return getTrades()[0]; }
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('exchangeRecurring', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/recurring.pug');
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

  it('should set fiatAmount', () => {
    scope = getControllerScope(handlers);
    expect(scope.$ctrl.trade().fiatAmount).toBe(75);
  });
});
