describe('CoinifyCheckoutController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let $q;
  let scope;
  let modals;
  let Alerts;
  let Wallet;
  let MyWallet;
  let coinify;
  let Exchange;
  // let exchangeRate;

  let mockTrade = () =>
    ({
      id: 'TRADE',
      refresh () {},
      watchAddress () {}
    })
  ;

  let mockMediums = () =>
    ({
      bank: {
        limitInAmounts: {'EUR': 10},
        minimumInAmounts: {'INR': 1000},
        buy () { return $q.resolve(mockTrade()); }
      }
    })
  ;

  let mockQuote = fail =>
    ({
      quoteAmount: 150,
      rate: 867,
      getPaymentMediums () { if (fail) { return $q.reject(fail); } else { return $q.resolve(mockMediums()); } }
    })
  ;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {

    module(($provide) => {
      $provide.value('Env', Promise.resolve({
        partners: {
          coinify: {
            countries: ['US'],
            showRecurringBuy: true
          },
          qaDebugger: true
        }
      }));
    });

    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;

      $q = $injector.get('$q');
      modals = $injector.get('modals');
      Alerts = $injector.get('Alerts');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');
      // coinify = $injector.get('coinify');
      Exchange = $injector.get('Exchange');
      // exchangeRate = $injector.get('exchangeRate');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});
      Wallet.settings = { currency: { code: 'EUR' } }
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      MyWallet.wallet.external = {
        coinify: {
          profile: {}
        }
      };

      let currency = $injector.get('currency');
      return currency.conversions['USD'] = { conversion: 2 };
    })
  });

  beforeEach(function () {
    coinify = {
      exchange: {
        kycs: [],
        trades: [{state: 'failed'}, {state: 'completed'}, {state: 'awaiting_transfer_in', tradeSubscriptionId: 1}]
      },
      trades: [{id: 2}],
      subscriptions: [{id: 1}],
      pollUserLevel () { return 1; },
      limits: {
        card: {
          inRemaining: {
            EUR: 300
          }
        }
      },
      states: {
        completed: ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'],
        pending: ['awaiting_transfer_in', 'reviewing', 'processing', 'pending', 'updateRequested']
      },
      tradeStateIn: (states) => (t) => states.indexOf(t.state) > -1,
      openPendingKYC: () => { return $q.resolve(); },
      getPendingKYC: () => { return $q.resolve(); },
      getRejectedKYC: () => { return $q.resolve(); },
      cancelSubscription: (id) => { return $q.resolve(id); }
    };
  });

  let getControllerScope = function (accounts, showCheckout) {
    scope = $rootScope.$new();
    scope.vm = { external: { coinify: {
      profile: {
        limits: {
          buy: 100
        },
        currentLimits: {
          bank: {
            inRemaining: 100
          }
        },
      },
      trades: [
        {id: 123, amount: 100}
      ],
      getBuyQuote () { return $q.resolve(mockQuote()); },
      fetchProfile () { return $q.resolve(); }
    }
    }
  };
    let template = $templateCache.get('partials/coinify/checkout.pug');
    $controller('CoinifyCheckoutController', {
      $scope: scope,
      coinify: coinify,
      accounts: accounts || [],
      mediums: mockMediums() || {},
    }
    );
    $compile(template)(scope);
    return scope;
  };

  it('should set the trades', () => {
    scope = getControllerScope();
    expect(scope.recurringTrades()).toBeTruthy();
    expect(scope.completedTrades()).toBeTruthy();
    expect(scope.pendingTrades().length).toBe(0);
  });

  describe('openKYC()', () => {
    it('should call coinify.openPendingKYC', () => {
      scope = getControllerScope();
      spyOn(coinify, 'openPendingKYC')
      scope.openKYC();
      expect(coinify.openPendingKYC).toHaveBeenCalled();
    })
  })

  describe('pendingKYC()', () => {
    it('should call coinify.getPendingKYC', () => {
      scope = getControllerScope();
      spyOn(coinify, 'getPendingKYC');
      scope.pendingKYC();
      expect(coinify.getPendingKYC).toHaveBeenCalled();
    })
  })

  describe('cancelSubscription()', () => {
    it('should call coinify.cancelSubscription with an id', () => {
      scope = getControllerScope();
      spyOn(coinify, 'cancelSubscription');
      scope.cancelSubscription(5);
      expect(coinify.cancelSubscription).toHaveBeenCalledWith(5);
    })
  })

  describe('subscriptions()', () => {
    it('should get subscriptions from coinify service', () => {
      scope = getControllerScope();
      scope.subscriptions();
      expect(scope.subscriptions()).toBe(coinify.subscriptions);
    });
  })

  describe('buyFiatHandler()', () => {
    it('should set buyFiat to the currency passed in', () => {
      let curr = {code: 'USD'};
      scope = getControllerScope();
      scope.buyFiatHandler(curr);
      expect(scope.buyFiat).toBe(curr);
    });
  })

  describe('sellFiatHandler()', () => {
    it('should set sellFiat to the currency passed in', () => {
      let curr = {code: 'USD'};
      scope = getControllerScope();
      scope.sellFiatHandler(curr);
      expect(scope.sellFiat).toBe(curr);
    });
  })

  describe('recurringBuyLimit()', () => {
    it('should return the limits', () => {
      scope = getControllerScope();
      expect(scope.recurringBuyLimit()).toBe(300);
    });

    it('should return the card limits', () => {
      scope = getControllerScope();
      scope.exchange.user = { id: 1 };
      scope.buyFiat.code = 'EUR';
      expect(scope.recurringBuyLimit()).toBe(coinify.limits.card.inRemaining['EUR']);
    });
  })
});
