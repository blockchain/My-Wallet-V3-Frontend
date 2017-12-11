describe('CoinifySummaryController', () => {
  let $q;
  let scope;
  let $rootScope;
  let $controller;
  let Alerts;
  let validBuy = true;

  let accounts = [
    {
      buy () { if (validBuy) { return $q.resolve(trade); } else { return $q.reject({error_description: 'Error'}); } }
    }
  ];

  let mediums = {
    'card': {
      'fee': 1,
      'total': 101,
      getAccounts () { return $q.resolve(accounts); }
    },
    'bank': {
      getAccounts () { return $q.resolve(accounts); }
    }
  };

  let exchange = {
    profile: {
      limits: {
        'card': {
          'inRemaining': 100,
          'minimumInAmounts': { 'EUR': 100 }
        }
      }
    },
    accounts: accounts,
    fetchProfile: () => $q.resolve(),
    getBuyQuote: () => $q.resolve(quote),
    getSubscriptions: () => $q.resolve()
  };

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'USD',
    paymentMediums: mediums,
    getPaymentMediums () { return $q.resolve(mediums); }
  };

  let trade = {
    state: 'awaiting_transfer_in',
    inCurrency: 'USD',
    outCurrency: 'BTC',
    watchAddress () { return $q.resolve(); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      let MyWallet = $injector.get('MyWallet');
      Alerts = $injector.get('Alerts');

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {index: 0},
          accounts: [{label: 'Phil'}]
        },
        external: {
          coinify: exchange
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
      exchange: exchange,
      baseFiat () { return true; },
      watchAddress () {},
      fiatCurrency () { return 'USD'; },
      transactionFee () { return .001; },
      fiatAmount () { return -100; },
      BTCAmount () { return 1; },
      goTo (state) {}
    };

    $controller('CoinifySummaryController',
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('.commitValues()', function () {
    it('should disable the form', () => {
      spyOn(scope, 'lock');
      scope.commitValues();
      return expect(scope.lock).toHaveBeenCalled();
    });

    it('should set a new quote', () => {
      scope.commitValues();
      scope.$digest();
      return expect(scope.vm.quote).toBe(quote);
    });
  });

  describe('.buy()', function () {
    it('should reset the quote and set the trade', () => {
      scope.buy();
      scope.$digest();
      expect(scope.vm.quote).toBe(null);
      return expect(scope.vm.trade).toBe(trade);
    });

    it('should display an error', () => {
      spyOn(Alerts, 'displayError');
      validBuy = false;
      scope.buy();
      scope.$digest();
      return expect(Alerts.displayError).toHaveBeenCalled();
    });
  });
});
