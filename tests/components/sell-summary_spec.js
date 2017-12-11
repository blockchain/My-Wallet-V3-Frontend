describe('sell-summary.component', () => {
  let $q;
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;
  let Wallet;
  let scope;

  let transaction = {
    currency: { code: 'DKK' },
    btc: 0.01,
    fiat: 100,
    fee: { btc: 0.0001 }
  };

  let sellTrade = {
    id: '12345',
    state: 'awaiting_transfer_in',
    inCurrency: 'BTC',
    outCurrency: 'EUR',
    receiveAmount: 100,
    transferIn: {
      sendAmount: '.01527447',
      medium: 'blockchain'
    },
    transferOut: {
      details: {
        account: {
          number: '123456789ABCDEFG'
        }
      }
    }
  };

  let bankAccount = {
    sell (bankId) { return $q.resolve(sellTrade); },
    updateQuote (quote) { return $q.resolve('something'); },
    quote: { expiresAt: 1493928203205 }
  };

  let quote = {
    expiresAt: 1494028203205,
    paymentMediums: {'bank': {'outPercentageFee': 3}}
  };

  let handlers = {
    transaction,
    sellTrade,
    bankAccount,
    quote,
    sellRateForm: true,
    fields: true
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('sellSummary', {$scope: scope}, bindings);
    let template = $templateCache.get('partials/coinify/sell-summary.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');

      let askForSecondPassword = $q.defer();
      Wallet.askForSecondPasswordIfNeeded = () => askForSecondPassword.promise;

      Wallet.my.wallet = {
        hdwallet: {
          defaultAccount: {index: 0}
        },
        createPayment: () => ({
          from: () => {},
          amount: () => {},
          updateFeePerKb: () => {},
          sideEffect: () => {}
        })
      };
    })
  );

  describe('.sell()', () => {
    let ctrl;
    beforeEach(() => ctrl = getController(handlers));

    it('should set waiting to true', () => {
      ctrl.sell();
      expect(ctrl.waiting).toEqual(true);
    });

    it('should call Wallet.askForSecondPasswordIfNeeded()', inject(function (Wallet) {
      spyOn(Wallet, 'askForSecondPasswordIfNeeded').and.callThrough();
      ctrl.sell();
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled();
    }));
  });

  describe('.checkForUpdatedQuote()', () => {
    it('should update the quote if there is a newer one', () => {
      let ctrl = getController(handlers);
      spyOn(ctrl.bankAccount, 'updateQuote');
      ctrl.checkForUpdatedQuote();
      expect(ctrl.bankAccount.updateQuote).toHaveBeenCalled();
    });
  });
});
