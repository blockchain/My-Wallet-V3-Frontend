describe('sell-quick-start.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let $q;
  let scope;
  let Wallet;
  let buySell = {};

  let transaction = {
    currency: {
      code: 'EUR'
    },
    btc: 0.01,
    fiat: 100,
    fee: {
      btc: 0.0001
    }
  };

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'EUR',
    getPaymentMediums () { return $q.resolve(); }
  };

  let handlers = {transaction};

  let getController = function (bindings) {
    scope = $rootScope.$new(true);
    let ctrl = $componentController('sellQuickStart', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/sell-quick-start.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) {
      let mediums;
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');
      let MyWalletPayment = $injector.get('MyWalletPayment');
      buySell = $injector.get('buySell');
      let currency = $injector.get('currency');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      MyWallet.wallet = {
        createPayment (p, shouldFail, failWith) { return new MyWalletPayment(MyWallet.wallet, p, shouldFail, failWith); }
      };

      currency.conversions['EUR'] = { conversion: 1 };

      buySell.getQuote = () => $q.resolve(quote);

      buySell.getSellQuote = (amount, curr, quoteCurr) => $q.resolve(quote).then();

      buySell.getExchange = () => ({
        getTrades () { return $q.resolve(); },
        getKYCs () { return $q.resolve(); },
        trades: {
          pending: {}
        },
        user: 1,
        _profile: {
          _country: 'FR',
          level: {
            limits: {
              'card': {
                in: 300
              },
              'bank': {
                in: 0
              }
            }
          }
        },
        kycs: [],
        mediums
      });
      mediums = {
        'card': {
          getAccounts () { return $q.resolve([]); }
        },
        'bank': {
          getAccounts () { return $q.resolve([]); }
        }
      };
    })
  );

  describe('checkForNoFee()', () => {
    it('should call getDefaultAccountIndex', () => {
      getController(handlers);
      spyOn(Wallet, 'getDefaultAccountIndex');
      scope.checkForNoFee();
      expect(Wallet.getDefaultAccountIndex).toHaveBeenCalled();
    });
  });

  describe('offerUseAll()', () => {
    it('should set maxSpendableAmount to the first number in the array', () => {
      getController(handlers);
      let paymentInfo = {
        maxSpendableAmounts: [1, 2, 3, 4, 5],
        sweepFees: [5, 4, 3, 2, 1]
      };
      let payment = {};
      scope.offerUseAll(payment, paymentInfo);
      expect(scope.maxSpendableAmount).toEqual(1);
    });

    describe('useAll()', () => {
      it('should set sweepTransaction to true', () => {
        getController(handlers);
        scope.useAll();
        expect(scope.isSweepTransaction).toEqual(true);
      });
    });
  });
});
