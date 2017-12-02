describe('SfoxBuyController', () => {
  let scope;
  let MyWallet;
  let $rootScope;
  let $controller;
  let sfox;
  let $q;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

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
        buy() { return $q.resolve(mockTrade()); },
        getAccounts() { return $q.resolve([]); }
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

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      MyWallet = $injector.get('MyWallet');
      Wallet = $injector.get('Wallet');
      Alerts = $injector.get('Alerts');
      sfox = $injector.get('sfox');

      MyWallet.wallet = {};
      return MyWallet.wallet.external = {
        sfox: {
          profile: {}
        }
      };}));

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo() {},
      exchange: {
        fetchProfile() { return $q.resolve(); },
        getBuyMethods() { return $q.resolve(mockMediums()); },
        profile: {
          limits: {
            buy: 100
          },
          verificationStatus: {
            level: 'verified'
          }
        }
      }
    };

    $controller("SfoxBuyController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('.quoteHandler()', () =>
    it('should fetch a quote', () => {
      spyOn(sfox, "fetchQuote");
      scope.quoteHandler();
      return expect(sfox.fetchQuote).toHaveBeenCalled();
    })
  );

  describe('.setState()', () =>
    it('should set limits', () => {
      scope.setState();
      return expect(scope.state.limits.max).toBeDefined();
    })
  );
});
