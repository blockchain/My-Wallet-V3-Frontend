describe('UnocoinCheckoutController', () => {
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
  let unocoin;
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
      ach: {
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

  beforeEach(() =>
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
      unocoin = $injector.get('unocoin');
      // exchangeRate = $injector.get('exchangeRate');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      MyWallet.wallet.external = {
        unocoin: {
          profile: {}
        }
      };

      let currency = $injector.get('currency');
      return currency.conversions['USD'] = { conversion: 2 }; }));

  let getControllerScope = function (accounts, showCheckout) {
    scope = $rootScope.$new();
    scope.vm = { external: { unocoin: {
      profile: {
        limits: {
          buy: 100
        },
        currentLimits: {
          bank: {
            inRemaining: 100
          }
        },
        verificationStatus: { level: 'unverified'
      }
      },
      trades: [
        {id: 123, amount: 100}
      ],
      getBuyQuote () { return $q.resolve(mockQuote()); },
      fetchProfile () { return $q.resolve(); }
    }
    }
  };
    let template = $templateCache.get('partials/unocoin/checkout.pug');
    $controller('UnocoinCheckoutController', {
      $scope: scope,
      accounts: accounts || [],
      showCheckout: showCheckout || undefined,
      exchangeRate: 1
    }
    );
    $compile(template)(scope);
    return scope;
  };

  it('should set scope.openUnocoinSignup on init', () => {
    scope = getControllerScope([{ status: 'active' }]);
    spyOn(modals, 'openUnocoinSignup').and.returnValue($q.resolve());
    scope.openUnocoinSignup();
    return expect(modals.openUnocoinSignup).toHaveBeenCalledWith(scope.vm.external.unocoin, undefined);
  });

  describe('setState()', () =>
    it('should set trades', () => {
      scope = getControllerScope();
      scope.setState();
      expect(scope.state.trades[0]['id']).toBe(123);
    })
  );

  describe('buySuccess', () => {
    it('should call openBankTransfer', () => {
      scope = getControllerScope();
      let trade = { id: 10 };
      spyOn(modals, 'openBankTransfer');
      scope.buySuccess(trade);
      expect(modals.openBankTransfer).toHaveBeenCalledWith({ id: 10 });
    });
  });

  describe('buyHandler()', () => {
    it('should call unocoin.buy', () => {
      scope = getControllerScope();
      let quote = { id: 1, amount: 10 };
      let account = { id: 2, name: 'phil' };
      spyOn(unocoin, 'buy');
      scope.buyHandler(quote, account);
      expect(unocoin.buy).toHaveBeenCalledWith({id: 1, amount: 10}, {id: 2, name: 'phil'});
    });
  });

  describe('buyError()', () => {
    it('should call displayError', () => {
      scope = getControllerScope();
      spyOn(Alerts, 'displayError');
      scope.buyError();
      expect(Alerts.displayError).toHaveBeenCalled();
    });
  });

  describe('inspectTrade()', () => {
    it('should openBankTransfer if state is awaiting_reference_number', () => {
      scope = getControllerScope();
      let quote = {};
      let trade = { id: 10, state: 'awaiting_reference_number' };
      spyOn(modals, 'openBankTransfer');
      scope.inspectTrade(quote, trade);
      expect(modals.openBankTransfer).toHaveBeenCalledWith(trade);
    });

    it('should openTradeSummary if state is not awaiting_reference_number', () => {
      scope = getControllerScope();
      let quote = {};
      let trade = { id: 10, state: 'processing' };
      spyOn(modals, 'openTradeSummary');
      scope.inspectTrade(quote, trade);
      expect(modals.openTradeSummary).toHaveBeenCalledWith(trade);
    });
  });
});
