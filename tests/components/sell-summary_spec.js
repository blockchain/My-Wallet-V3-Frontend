describe('sell-summary.component', () => {
  let $q;
  let scope;
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;

  let transaction = {
    currency: {
      code: 'DKK'
    },
    btc: 0.01,
    fiat: 100,
    fee: {
      btc: 0.0001
    }
  };

  let sellTrade = {
    id: '12345',
    state: 'awaiting_transfer_in',
    inCurrency: 'BTC',
    outCurrency: 'EUR',
    outAmountExpected: 100,
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
    quote: {
      expiresAt: 1493928203205
    }
  };

  let quote = {
    expiresAt: 1494028203205
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
    })
  );

  describe('.insufficientFunds()', () => {
    it('should be true if the wallet does not have enough funds', () => {
      let ctrl = getController(handlers);
      ctrl.totalBalance = 0.001;
      let result = ctrl.insufficientFunds();
      expect(result).toEqual(true);
    });
  });

  describe('.isDisabled()', () => {
    it('should be disabled if insufficient funds', () => {
      let ctrl = getController(handlers);
      ctrl.totalBalance = 0.001;
      let result = ctrl.isDisabled();
      expect(result).toEqual(true);
    });

    it('should disable if the form is invalid', () => {
      let ctrl = getController(handlers);
      ctrl.sellRateForm.$valid = false;
      let result = ctrl.isDisabled();
      expect(result).toEqual(true);
    });

    it('should disable if there is no quote attached to sell Trade', () => {
      let ctrl = getController(handlers);
      ctrl.totalBalane = 1;
      ctrl.sellRateForm.$valid = true;
      let result = ctrl.isDisabled();
      expect(result).toEqual(undefined);
    });
  });

  describe('.sell()', () => {
    it('should set waiting to true', () => {
      let ctrl = getController(handlers);
      ctrl.sell();
      expect(ctrl.waiting).toEqual(true);
    });

    it('should call bankAccount.sell(bankId)', () => {
      let ctrl = getController(handlers);
      spyOn(ctrl.bankAccount, 'sell');
      ctrl.sell();
      expect(ctrl.bankAccount.sell).toHaveBeenCalled();
    });
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
