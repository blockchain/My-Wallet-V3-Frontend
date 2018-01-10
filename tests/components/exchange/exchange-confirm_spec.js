describe('exchange-confirm.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let scope;
  let Wallet;
  let $q;

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

  let mockMediums = () =>
    ({
      ach: {
        buy () { return $q.resolve(); }
      }
    })
  ;

  let mockQuote = fail =>
    ({
      quoteAmount: 150,
      rate: 867,
      expiresAt: new Date(Date.now() + 1e8),
      getPaymentMediums () { if (fail) { return $q.reject(fail); } else { return $q.resolve(mockMediums()); } }
    })
  ;

  let handlers = {
    quote: mockQuote(),
    viewDetails () { return $q.resolve(); },
    onSuccess () { return $q.resolve(); },
    handleTrade: (quote) => $q.resolve().then(handlers.onSuccess),
    exTrade: getTrades()[0],
    onExpiration: () => $q.resolve().then(() => { return $q.resolve(); })
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('exchangeConfirm', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/confirm.pug');
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

      $q = $injector.get('$q');
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
  });

  describe('.getTimeToExpiration()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should return the diff between quote expiration and now', () => {
      expect(scope.getTimeToExpiration()).toBeDefined();
    });
  });

  describe('.onExpiration()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should return the diff between quote expiration and now', () => {
      scope.onExpiration();
      expect(scope.$ctrl.quote).toBe(null);
      expect(scope.locked).toBe(true);
    });
  });

  describe('.trade()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should return the diff between quote expiration and now', () => {
      scope.trade();
      expect(scope.locked).toBe(true);
    });
  });
});
