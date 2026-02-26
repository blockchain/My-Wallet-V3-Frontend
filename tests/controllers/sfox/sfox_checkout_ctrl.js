describe('SfoxCheckoutController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let $q;
  let sfox;
  let scope;
  let modals;
  let Wallet;
  let MyWallet;

  let mockTrade = () => ({
    id: 'TRADE',
    refresh () {},
    watchAddress () {}
  });

  let mockMediums = () => ({
    ach: {
      buy () { return $q.resolve(mockTrade()); }
    }
  });

  let mockQuote = fail => ({
    quoteAmount: 150,
    rate: 867,
    getPaymentMediums () { if (fail) { return $q.reject(fail); } else { return $q.resolve(mockMediums()); } }
  });

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
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');

      MyWallet.wallet = {
        accountInfo: {
          email: 'satoshi@gmail.com'
        }
      };
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      MyWallet.wallet.external = {
        sfox: {
          profile: {
            limits: { buy: 100, sell: 100 },
            verificationStatus: { level: 'verified' }
          },
          trades: []
        }
      };

      sfox = $injector.get('sfox');
      let currency = $injector.get('currency');
      currency.conversions['USD'] = { conversion: 2 };
      return currency.conversions['USD'];
    })
  );

  let getControllerScope = function (accounts) {
    scope = $rootScope.$new();
    scope.vm = {
      external: {
        sfox: {
          profile: { verificationStatus: { level: 'unverified' } },
          getBuyQuote () { return $q.resolve(mockQuote()); },
          getSellQuote () { return $q.resolve(mockQuote()); },
          fetchProfile () { return $q.resolve(); },
          trades: []
        }
      }
    };
    let template = $templateCache.get('partials/sfox/checkout.pug');
    $controller('SfoxCheckoutController', {
      sfox: sfox,
      $scope: scope,
      accounts: accounts || []
    });
    $compile(template)(scope);
    return scope;
  };

  it('should set scope.openSfoxSignup on init', () => {
    scope = getControllerScope([{status: 'active'}]);
    spyOn(modals, 'openSfoxSignup').and.returnValue($q.resolve());
    scope.checkout.openSfoxSignup();
    return expect(modals.openSfoxSignup).toHaveBeenCalledWith(scope.vm.external.sfox, undefined);
  });

  describe('.openSfoxSignup()', () =>
    it('should set modalOpen to false', () => {
      scope = getControllerScope([{status: 'active'}], true);
      spyOn(modals, 'openSfoxSignup').and.returnValue($q.resolve());
      scope.checkout.openSfoxSignup();
      scope.$digest();
      return expect(scope.modalOpen).toBe(false);
    })
  );
});
