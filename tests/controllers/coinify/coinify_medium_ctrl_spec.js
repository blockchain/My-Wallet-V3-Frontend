describe('CoinifyMediumController', () => {
  let $q;
  let $rootScope;
  let $controller;
  let scope;
  let coinify;
  let MyWallet;

  let mediums = {
    'card': {
      getAccounts () { return $q.resolve([]); }
    },
    'bank': {
      getAccounts () { return $q.resolve([]); }
    }
  };
  
  let frequency = 'Daily';

  let quote = {
    quoteAmount: 1,
    baseAmount: -30000,
    baseCurrency: 'EUR',
    getPaymentMediums () { return $q.resolve(mediums); }
  };

  let kyc = {
    id: 111,
    state: 'pending',
    createdAt: new Date()
  };

  let accounts = [{ buy () {} }];

  let exchange = {
    profile: {
      limits: {
        'card': {
          'inRemaining': { 'EUR': 50000 },
          'minimumInAmounts': { 'EUR': 100 }
        },
        'bank': {
          'minimumInAmounts': { 'EUR': 90 }
        }
      }
    },
    accounts: accounts,
    kycs: [kyc],
    fetchProfile: () => $q.resolve(),
    getBuyQuote: () => $q.resolve(quote)
  };

  beforeEach(angular.mock.module('walletApp'));
  
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      coinify = $injector.get('coinify');
      MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        external: { coinify: exchange }
      };
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }

    scope = $rootScope.$new();
    scope.vm = {
      quote,
      exchange,
      frequency,
      medium: 'card',
      baseFiat () { return true; },
      fiatCurrency () { return 'EUR'; },
      goTo (state) {}
    };

    $controller('CoinifyMediumController', {$scope: scope});

    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('.belowCardMax()', function () {
    it('should be true if amount is less than or equal to card max', () => {
      return expect(scope.belowCardMax).toBe(true);
    });
  });

  describe('.aboveBankMin()', function () {
    it('should be true if amount is greater than or equal to bank min', () => {
      return expect(scope.aboveBankMin).toBe(true);
    });
  });

  describe('.pendingKYC()', function () {
    it('should return true if the user has a kyc pending', () => {
      return expect(scope.pendingKYC()).toBe(true);
    });
  });

  describe('.openKYC()', function () {
    it('should get open KYC and go to isx step', () => {
      spyOn(coinify, 'getOpenKYC');
      spyOn(scope.vm, 'goTo');
      scope.openKYC();
      scope.$digest();
      expect(coinify.getOpenKYC).toHaveBeenCalled();
      return expect(scope.vm.goTo).toHaveBeenCalledWith('isx');
    });
  });

  describe('.submit()', function () {
    it('should disable the form', () => {
      spyOn(scope, 'lock');
      scope.submit();
      return expect(scope.lock).toHaveBeenCalled();
    });

    it('should getPaymentMediums', () => {
      spyOn(quote, 'getPaymentMediums');
      scope.submit();
      return expect(quote.getPaymentMediums).toHaveBeenCalled();
    });

    it('should go to summary', () => {
      spyOn(scope.vm, 'goTo');
      scope.submit();
      scope.$digest();
      return expect(scope.vm.goTo).toHaveBeenCalledWith('summary');
    });
  });
});
