describe('CoinifyMediumController', () => {
  let $q;
  let scope;
  let Wallet;
  let $rootScope;
  let $controller;
  let buySell;

  let mediums = {
    'card': {
      getAccounts() { return $q.resolve([]); }
    },
    'bank': {
      getAccounts() { return $q.resolve([]); }
    }
  };

  let quote = {
    quoteAmount: 1,
    baseAmount: -30000,
    baseCurrency: 'USD',
    getPaymentMediums() { return $q.resolve(mediums); }
  };

  let kyc = {
    id: 111,
    state: 'pending',
    createdAt: new Date()
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      Wallet = $injector.get('Wallet');
      buySell = $injector.get('buySell');

      buySell.kycs = [kyc];

      return buySell.limits = {
        bank: {
          min: {
            'EUR': 300
          },
          max: {
            'EUR': 1000
          },
          yearlyMax: {
            'EUR': 299
          }
        },
        card: {
          min: {
            'EUR': 10
          },
          max: {
            'EUR': 300
          }
        }
      };
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      quote,
      medium: 'card',
      baseFiat() { return true; },
      fiatCurrency() { return 'EUR'; },
      goTo(state) {}
    };

    $controller("CoinifyMediumController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('.belowCardMax()', () =>

    it('should be true if amount is less than or equal to card max', () => expect(scope.belowCardMax).toBe(true))
  );

  describe('.aboveBankMin()', () =>

    it('should be true if amount is greater than or equal to bank min', () => expect(scope.aboveBankMin).toBe(true))
  );

  // describe ".needsKYC()", ->
  //
  //   it "should return true if amount is greater than yearlyMax", ->
  //     expect(scope.needsKYC('bank')).toBe(true)
  //

  describe('.pendingKYC()', () =>

    it('should return true if the user has a kyc pending', () => expect(scope.pendingKYC()).toBe(true))
  );

  describe('.openKYC()', () =>

    it('should get open KYC and go to isx step', () => {
      spyOn(buySell, 'getOpenKYC');
      spyOn(scope.vm, 'goTo');
      scope.openKYC();
      scope.$digest();
      expect(buySell.getOpenKYC).toHaveBeenCalled();
      return expect(scope.vm.goTo).toHaveBeenCalledWith('isx');
    })
  );

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
