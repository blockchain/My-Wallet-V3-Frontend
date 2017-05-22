describe('SfoxCheckoutController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let $q;
  let $timeout;
  let scope;
  let modals;
  let Alerts;
  let Wallet;
  let MyWallet;
  let sfox;

  let mockTrade = () =>
    ({
      id: 'TRADE',
      refresh() {},
      watchAddress() {}
    })
  ;

  let mockMediums = () =>
    ({
      ach: {
        buy() { return $q.resolve(mockTrade()); }
      }
    })
  ;

  let mockQuote = fail =>
    ({
      quoteAmount: 150,
      rate: 867,
      getPaymentMediums() { if (fail) { return $q.reject(fail); } else { return $q.resolve(mockMediums()); } }
    })
  ;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;

      $q = $injector.get('$q');
      $timeout = $injector.get('$timeout');
      modals = $injector.get('modals');
      Alerts = $injector.get('Alerts');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');
      sfox = $injector.get('sfox');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      MyWallet.wallet.external = {
        sfox: {
          profile: {}
        }
      };

      let currency = $injector.get('currency');
      return currency.conversions["USD"] = { conversion: 2 };}));

  let getControllerScope = function (accounts, showCheckout) {
    scope = $rootScope.$new();
    scope.vm = { external: { sfox: {
      profile: {
        limits: { buy: 100
      },
        verificationStatus: { level: "unverified"
      }
      },
      getBuyQuote() { return $q.resolve(mockQuote()); },
      fetchProfile() { return $q.resolve(); }
    }
    }
  };
    let template = $templateCache.get('partials/sfox/checkout.pug');
    $controller("SfoxCheckoutController", {
      $scope: scope,
      accounts: accounts || [],
      showCheckout: showCheckout || undefined
    }
    );
    $compile(template)(scope);
    return scope;
  };

  it('should set scope.openSfoxSignup on init', () => {
    scope = getControllerScope([{status:'active'}]);
    spyOn(modals, "openSfoxSignup").and.returnValue($q.resolve());
    scope.openSfoxSignup();
    return expect(modals.openSfoxSignup).toHaveBeenCalledWith(scope.vm.external.sfox, undefined);
  });

  describe('.openSfoxSignup()', () =>
    it('should set modalOpen to false', () => {
      scope = getControllerScope([{status:'active'}], true);
      spyOn(modals, "openSfoxSignup").and.returnValue($q.resolve());
      scope.openSfoxSignup();
      scope.$digest();
      return expect(scope.modalOpen).toBe(false);
    })
  );

  describe('showCheckout', () => {
    beforeEach(() => scope = getControllerScope([{}], true));

    it('should show if signup is completed', () => {
      scope.signupCompleted = true;
      scope.$digest();
      return expect(scope.showCheckout).toBe(true);
    });

    it('should show if signup is not completed but showCheckout is true', () => {
      scope.signupCompleted = false;
      scope.$digest();
      return expect(scope.showCheckout).toBe(true);
    });
  });
});
