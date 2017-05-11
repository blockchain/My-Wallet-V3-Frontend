describe('CoinifyController', () => {
  let $rootScope;
  let $controller;
  let options;
  let buySell;
  let $scope;
  let Alerts;
  let $q;

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'USD',
    expiresAt: 100000000,
    getPaymentMediums () { return $q.resolve(); }
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
      Alerts = $injector.get('Alerts');

      options = {
        partners: {
          coinify: {
            surveyLinks: ['www.blockchain.com/survey']
          }
        }
      };

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {
            index: 0
          },
          accounts: [{label: ''}]
        }
      };
      return {
        buySell: {
          getQuote(quote) { return $q.resolve(quote); }
        }
      };}));

  let getController = function (quote, trade, options) {
    let scope = $rootScope.$new();

    return $controller("CoinifyController", {
      $scope: scope,
      trade: trade || null,
      quote: quote || null,
      options: options || {},
      $uibModalInstance: { close() {}, dismiss() {} }
    });
  };

  describe('.baseFiat()', function () {
    let ctrl;
    beforeEach(() => {
      ctrl = getController(quote)
    });

    it('should be true if baseCurrency is fiat', () => {
      expect(ctrl.baseFiat()).toBe(true)
    });
  });

  describe('.BTCAmount()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return BTC amount', () => expect(ctrl.BTCAmount()).toBe(1));
  });

  describe('.fiatAmount()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return fiat amount', () => expect(ctrl.fiatAmount()).toBe(1));
  });

  describe('.fiatCurrency()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return fiat currency', () => expect(ctrl.fiatCurrency()).toBe('USD'));
  });

  describe('.expireTrade()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should expire the trade', () => {
      ctrl.expireTrade();
      $rootScope.$digest();
      return expect(ctrl.state.trade.expired).toBe(true);
    });
  });

  describe('.timeToExpiration()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return expiration time of quote', () => expect(ctrl.timeToExpiration()).toBe(100000000 - ctrl.now()));
  });

  describe('.refreshQuote()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should refresh a quote from fiat', () => {
      spyOn(buySell, 'getQuote');
      ctrl.refreshQuote();
      $rootScope.$digest();
      return expect(buySell.getQuote).toHaveBeenCalledWith(1, 'USD');
    });

    it('should refresh a quote form BTC', () => {
      spyOn(buySell, 'getQuote');
      ctrl.quote.baseCurrency = 'BTC';
      ctrl.quote.quoteCurrency = 'USD';
      ctrl.refreshQuote();
      $rootScope.$digest();
      return expect(buySell.getQuote).toHaveBeenCalledWith(0.000001, 'BTC', 'USD');
    });
  });

  describe('.expireTrade()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should set expired trade state', () => {
      ctrl.expireTrade();
      $rootScope.$digest();
      return expect(ctrl.state.trade.expired).toBe(true);
    });
  });

  describe('.goTo()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController());

    it('should set the step', () => {
      ctrl.goTo('email');
      return expect(ctrl.currentStep()).toBe('email');
    });
  });

  describe('initial state', function () {
    beforeEach(function () { let ctrl;
    return ctrl = undefined; });

    it('should ask user to verify email', inject(function (Wallet) {
      Wallet.user.isEmailVerified = false;
      buySell.getExchange = () => ({ profile: {} });
      let ctrl = getController();
      return expect(ctrl.currentStep()).toBe('email');
    })
  );

    it('should ask user to signup if email is verified',inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      let ctrl = getController();
      return expect(ctrl.currentStep()).toBe('signup');
    })
    );

    it('should ask user to select payment medium',inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(quote, null);
      return expect(ctrl.currentStep()).toBe('select-payment-medium');
    })
    );

    it('should ask user to complete isx after a trade is created',inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(null, trade);
      return expect(ctrl.currentStep()).toBe('isx');
    })
    );

    it('should show a completed trade summary',inject(function (Wallet) {
      let trade =
        {state: 'completed'};
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(null, trade);
      return expect(ctrl.currentStep()).toBe('trade-complete');
    })
    );
  });
});
