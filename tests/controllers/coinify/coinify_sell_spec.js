describe('CoinifySellController', () => {
  let $rootScope;
  let $controller;
  let options;
  let buySellOptions;
  let accounts;
  let bankMedium;
  let payment;
  let trade;
  let user;

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'EUR',
    expiresAt: 100000000
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let currency = $injector.get('currency');
      let coinify = $injector.get('coinify');
      let MyWalletPayment = $injector.get('MyWalletPayment');

      options = {
        partners: { coinify: {} }
      };

      accounts = [{id: 123}, {id: 456}];

      trade = {
        quote: {
          quoteCurrency: 'EUR',
          quoteAmount: 1,
          baseAmount: -100,
          baseCurrency: 'EUR',
          expiresAt: 100000000,
          getPayoutMediums () { return $q.resolve(); }
        }
      };

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: { index: 0 },
          accounts: [{label: ''}]
        },
        external: {
          coinify: {
            getTrades: () => {},
            getSellQuote: () => {}
          }
        }
      };

      currency.conversions['EUR'] = { conversion: 1 };

      payment = {
        fees: { priority: 100 },
        sweepFee: 50
      };
    })
  );

  let getController = function (quote, trade, exchange) {
    let scope = $rootScope.$new();

    return $controller('CoinifySellController', {
      $scope: scope,
      trade: trade || {},
      user: user || {},
      quote: quote || {},
      options: options || {},
      buySellOptions: buySellOptions || {},
      accounts: accounts || [],
      bankMedium: bankMedium || {},
      payment: payment || {},
      $uibModalInstance: { close () {}, dismiss () {} }
    });
  };

  describe('.selectAccount()', function () {
    it('should set the bank account', () => {
      let ctrl = getController(quote, trade);
      ctrl.selectAccount({id: 12345});
      return expect(ctrl.selectedBankAccount).toEqual({id: 12345});
    });
  });

  describe('.goTo()', function () {
    it('should go to account step', () => {
      let ctrl = getController(quote, trade);
      ctrl.goTo('account');
      return expect(ctrl.step).toEqual(2);
    });
  });

  describe('.onCreateBankSuccess()', function () {
    it('should set the bankId', () => {
      let ctrl = getController(quote, trade);
      ctrl.onCreateBankSuccess({id: 123456});
      return expect(ctrl.selectedBankAccount).toEqual({id: 123456});
    });
  });

  describe('.onSellSuccess()', function () {
    it('should set the bankId', () => {
      let ctrl = getController(quote, trade);
      ctrl.onSellSuccess({id: 123});
      return expect(ctrl.sellTrade.id).toEqual(123);
    });
  });

  describe('.setTitle()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote, trade));

    it('should set the title for bank link', () => {
      ctrl.setTitle('bank-link');
      return expect(ctrl.title).toEqual('SELL.LINKED_ACCOUNTS');
    });

    it('should set the title for summary', () => {
      ctrl.setTitle('summary');
      return expect(ctrl.title).toEqual('SELL.CONFIRM_SELL_ORDER');
    });

    it('should set the title for trade-complete', () => {
      ctrl.setTitle('trade-complete');
      return expect(ctrl.title).toEqual('SELL.SELL_BITCOIN');
    });
  });

  describe('.now()', () =>
    it('should get the time', () => {
      let ctrl = getController(quote, trade);
      return ctrl.now();
    })
  );

  describe('.timeToExpiration()', function () {
    it('should return expiration time of quote', function () {
      let ctrl = getController(quote, trade);
      ctrl.timeToExpiration();
      // timeToExpiration must be within 3 milliseconds of current time
      return expect(ctrl.timeToExpiration() - (Math.floor(100000000 - ctrl.now())) <= 3).toBeTruthy();
    });
  });

  describe('.refreshQuote()', function () {
    it('should refresh the quote', () => {
      let onRefreshQuote = q => true;
      let ctrl = getController(quote, trade);
      return ctrl.refreshQuote().then(onRefreshQuote);
    });
  });

  describe('initial state', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote, trade));

    it('should go to isx step if isKYC', () => {
      ctrl.isKYC = true;
      ctrl.nextStep();
      return expect(ctrl.onStep('isx')).toEqual(true);
    });

    it('should go to trade-complete step', () => {
      ctrl.trade.state = 'awaiting_transfer_in';
      ctrl.trade.iSignThisID = undefined;
      ctrl.nextStep();
      return expect(ctrl.onStep('trade-complete')).toEqual(true);
    });

    it('should go to email step', () => {
      ctrl.exchange.profile = null;
      ctrl.exchange.user = undefined;
      ctrl.nextStep();
      return expect(ctrl.onStep('email')).toEqual(true);
    });

    it('should go to accept-terms step', () => {
      ctrl.exchange.profile = null;
      ctrl.exchange.user = false;
      ctrl.user.isEmailVerified = true;
      ctrl.nextStep();
      return expect(ctrl.onStep('accept-terms')).toEqual(true);
    });

    it('should go to account step', () => {
      ctrl.exchange.profile = null;
      ctrl.exchange.user = true;
      ctrl.accounts.length = 0;
      ctrl.nextStep();
      return expect(ctrl.onStep('account')).toEqual(true);
    });

    it('should go to bank-link step', () => {
      ctrl.exchange.profile = null;
      ctrl.exchange.user = true;
      ctrl.accounts.length = 1;
      ctrl.nextStep();
      return expect(ctrl.onStep('bank-link')).toEqual(true);
    });
  });

  describe('.getQuoteHelper()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote, trade));

    it('should return the right copy', () => {
      let result = ctrl.getQuoteHelper();
      return expect(result).toEqual('EST_QUOTE_1');
    });

    it('should return the right copy', () => {
      ctrl.quote.id = 123;
      let result = ctrl.getQuoteHelper();
      return expect(result).toEqual('SELL.QUOTE_WILL_EXPIRE');
    });
  });
});
