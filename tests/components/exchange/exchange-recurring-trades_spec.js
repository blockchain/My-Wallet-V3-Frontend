describe('exchange-recurring-trades.component', () => {
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
      subscriptionId: 1
    },
    {
      id: 2,
      amount: 200,
      subscriptionId: 2
    }
  ];

  let handlers = {
    buy () { return true; },
    subscription: { id: 1, isActive: true },
    partnerService: {
      cancelTrade: () => $q.resolve().then(() => { return false; })
    },
    namespace: 'COINIFY',
    fiat: {code: 'USD'},
    recurringBuyLimit () { return 100; },
    trades () { return getTrades; }
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('exchangeRecurringTrades', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/recurring-trades.pug');
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

  it('should get trades that match the subscription', () => {
    scope = getControllerScope(handlers);
    expect(scope.trades).toBeDefined();
  });

  describe('.canCancel()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should return true if state is "awaiting_transfer_in"', () => {
      expect(scope.canCancel({id: 1, state: 'awaiting_transfer_in'})).toBe(true);
    });
  });

  describe('.buyHandler()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should call this.buy() with trade, frequency, endTime', () => {
      scope = getControllerScope(handlers);
      spyOn(scope.$ctrl, 'buy');
      scope.buyHandler();
      expect(scope.$ctrl.buy).toHaveBeenCalled();
    });
  });

  describe('displayHelper()', () => {
    it('should return a string with the namespace and trade state', () => {
      scope = getControllerScope(handlers);
      let trade = { state: 'complete' };
      expect(scope.displayHelper(trade)).toBe('COINIFY.buy.complete.DISPLAY');
    });
  });

  describe('onCancel()', () => {
    it('should set the subscriptions active state', () => {
      scope = getControllerScope(handlers);

      let response = { isActive: false };
      scope.onCancel(response);
      expect(scope.$ctrl.subscription.isActive).toBe(false);
    });
  });

  describe('cancelTrade()', () => {
    it('should cancel the trade', () => {
      scope = getControllerScope(handlers);
      let trade = { state: 'awaiting_transfer_in', id: 10 };
      let message = 'message';
      scope.cancelTrade(trade, message, scope.$ctrl.subscription);
    });
  });

  describe('cancel()', () => {
    it('should cancel the trade', () => {
      scope = getControllerScope(handlers);
      let trade = { state: 'awaiting_transfer_in', id: 10 };
      let message = 'message';
      scope.cancelTrade(trade, message, scope.$ctrl.subscription);
    });
  });
});
