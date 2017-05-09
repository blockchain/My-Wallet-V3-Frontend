describe('CoinifySellController', () => {
  let $rootScope;
  let $controller;
  let options;
  let buySell;
  let buySellOptions;
  let $scope;
  let accounts;
  let bankMedium;
  let payment;
  let trade;
  let exchange;
  let user;

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'EUR',
    expiresAt: 100000000,
    getPayoutMediums() { return $q.resolve(); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let currency = $injector.get('currency');
      buySell = $injector.get('buySell');
      let MyWalletPayment = $injector.get('MyWalletPayment');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');

      options = {
        partners: {
          coinify: {}
        }
      };

      accounts = [{id: 123}, {id: 456}];
      trade = {
        quote: {
          quoteCurrency: 'EUR',
          quoteAmount: 1,
          baseAmount: -100,
          baseCurrency: 'EUR',
          expiresAt: 100000000,
          getPayoutMediums() { return $q.resolve(); }
        }
      };

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {
            index: 0
          },
          accounts: [{label: ''}]
        },
        createPayment(p, shouldFail, failWith) { return new MyWalletPayment(MyWallet.wallet, p, shouldFail, failWith); }
      };

      currency.conversions["EUR"] = { conversion: 1 };

      buySell.getExchange = () => ({
        getTrades() { return $q.resolve(); },
        getKYCs() { return $q.resolve(); },
        trades: {
          pending: {}
        },
        user: 1,
        profile: {
          country: 'FR',
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
        }
      }) ;

      payment = {
        absoluteFeeBounds: [100,100,100,100,100,100],
        sweepFees: [50,50,50,50,50,50]
      };
      return {
        buySell: {
          getQuote(quote) { return $q.resolve(quote).then(); }
        }
      };}));

  let getController = function (quote, trade, exchange) {
    let scope = $rootScope.$new();

    return $controller("CoinifySellController", {
      $scope: scope,
      trade: trade || {},
      user: user || {},
      quote: quote || {},
      options: options || {},
      buySellOptions: buySellOptions || {},
      accounts: accounts || [],
      bankMedium: bankMedium || {},
      payment: payment || {},
      exchange,
      $uibModalInstance: { close() {}, dismiss() {} }
    });
  };

  describe('.selectAccount()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = getController(quote, trade);
    });

    it('should set the bank account', () => {
      let ctrl = getController(quote, trade);
      ctrl.selectAccount({id: 12345});
      return expect(ctrl.selectedBankAccount).toEqual({id: 12345});
    });
  });

  describe('.goTo()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should go to account step', () => {
      let ctrl = getController(quote, trade);
      ctrl.goTo('account');
      return expect(ctrl.step).toEqual(2);
    });
  });

  describe('.reset()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should reset transaction amounts', () => {
      let ctrl = getController(quote, trade);
      ctrl.reset();
      expect(ctrl.transaction.btc).toEqual(null);
      return expect(ctrl.transaction.fiat).toEqual(null);
    });
  });

  describe('.onCreateBankSuccess()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should set the bankId', () => {
      let ctrl = getController(quote, trade);
      ctrl.onCreateBankSuccess({id: 123456});
      return expect(ctrl.selectedBankAccount).toEqual({id: 123456});
    });
  });

  describe('.onSellSuccess()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should set the bankId', () => {
      let ctrl = getController(quote, trade);
      ctrl.onSellSuccess({id: 123});
      return expect(ctrl.sellTrade.id).toEqual(123);
    });
  });

  describe('.cancel()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should reset the transaction', () => {
      let ctrl = getController(quote, trade);
      spyOn(ctrl, 'reset');
      ctrl.cancel();
      return expect(ctrl.reset).toHaveBeenCalled();
    });
  });

  describe('.setTitle()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should set the title for bank link', () => {
      let ctrl = getController(quote, trade);
      ctrl.setTitle('bank-link');
      return expect(ctrl.title).toEqual('SELL.LINKED_ACCOUNTS');
    });

    it('should set the title for summary', () => {
      let ctrl = getController(quote, trade);
      ctrl.setTitle('summary');
      return expect(ctrl.title).toEqual('SELL.CONFIRM_SELL_ORDER');
    });

    it('should set the title for trade-complete', () => {
      let ctrl = getController(quote, trade);
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
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should return expiration time of quote',function () {
      let ctrl = getController(quote, trade);
      ctrl.timeToExpiration();
      return expect(ctrl.timeToExpiration()).toEqual(100000000 - ctrl.now());
    });
  });

  describe('.refreshQuote()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should refresh the quote', () => {
      let onRefreshQuote = q => true;
      let ctrl = getController(quote, trade);
      spyOn(buySell, 'getSellQuote');
      return ctrl.refreshQuote().then(onRefreshQuote);
    });
  });

  describe('initial state', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should go to isx step if isKYC', () => {
      let ctrl = getController(quote, trade);
      ctrl.isKYC = true;
      ctrl.nextStep();
      return expect(ctrl.onStep('isx')).toEqual(true);
    });

    it('should go to trade-complete step', () => {
      let ctrl = getController(quote, trade);
      ctrl.trade.state = 'awaiting_transfer_in';
      ctrl.trade.iSignThisID = undefined;
      ctrl.nextStep();
      return expect(ctrl.onStep('trade-complete')).toEqual(true);
    });

    it('should go to email step', () => {
      let ctrl = getController(quote, trade);
      ctrl.exchange.user = undefined;
      ctrl.nextStep();
      return expect(ctrl.onStep('email')).toEqual(true);
    });

    it('should go to accept-terms step', () => {
      let ctrl = getController(quote, trade);
      ctrl.exchange.user = false;
      ctrl.user.isEmailVerified = true;
      ctrl.nextStep();
      return expect(ctrl.onStep('accept-terms')).toEqual(true);
    });

    it('should go to account step', () => {
      let ctrl = getController(quote, trade);
      ctrl.exchange.user = true;
      ctrl.accounts.length = 0;
      ctrl.nextStep();
      return expect(ctrl.onStep('account')).toEqual(true);
    });

    it('should go to bank-link step', () => {
      let ctrl = getController(quote, trade);
      ctrl.exchange.user = true;
      ctrl.accounts.length = 1;
      ctrl.nextStep();
      return expect(ctrl.onStep('bank-link')).toEqual(true);
    });
  });

  describe('.getQuoteHelper()', function () {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should return the right copy', () => {
      let ctrl = getController(quote, trade);
      let result = ctrl.getQuoteHelper();
      return expect(result).toEqual('EST_QUOTE_1');
    });

    it('should return the right copy', () => {
      let ctrl = getController(quote, trade);
      ctrl.quote.id = 123;
      let result = ctrl.getQuoteHelper();
      return expect(result).toEqual('SELL.QUOTE_WILL_EXPIRE');
    });
  });
});
