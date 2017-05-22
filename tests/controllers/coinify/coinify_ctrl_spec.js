describe('CoinifyController', () => {
  let $rootScope;
  let $controller;
  let buySell;
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
      buySell = $injector.get('buySell');
    }));

  let getController = function (quote, trade, options) {
    let scope = $rootScope.$new();

    let ctrl = $controller('CoinifyController', {
      $scope: scope,
      trade: trade || null,
      quote: quote || null,
      options: options || {},
      $uibModalInstance: { close () {}, dismiss () {} }
    });

    ctrl.$scope = scope;
    return ctrl;
  };

  describe('.baseFiat()', function () {
    let ctrl;
    beforeEach(() => {
      ctrl = getController(quote);
    });

    it('should be true if baseCurrency is fiat', () => {
      expect(ctrl.baseFiat()).toBe(true);
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
      expect(ctrl.state.trade.expired).toBe(true);
    });
  });

  describe('.goTo()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController());

    it('should set the step', () => {
      ctrl.goTo('email');
      expect(ctrl.currentStep()).toBe('email');
    });
  });

  describe('.exitToNativeTx()', () => {
    it('should call mobile interface with the correct tx hash', inject((buyMobile) => {
      let txHash = 'mock_tx_hash';
      spyOn(buyMobile, 'callMobileInterface');
      let ctrl = getController(null, { txHash });
      ctrl.$scope.exitToNativeTx();
      expect(buyMobile.callMobileInterface).toHaveBeenCalledWith(buyMobile.SHOW_TX, txHash);
    }));
  });

  describe('initial state', function () {
    it('should ask user to verify email', inject(function (Wallet) {
      Wallet.user.isEmailVerified = false;
      buySell.getExchange = () => ({ profile: {} });
      let ctrl = getController();
      expect(ctrl.currentStep()).toBe('email');
    }));

    it('should ask user to signup if email is verified', inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      let ctrl = getController();
      expect(ctrl.currentStep()).toBe('signup');
    }));

    it('should ask user to select payment medium', inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(quote, null);
      expect(ctrl.currentStep()).toBe('select-payment-medium');
    }));

    it('should ask user to complete isx after a trade is created', inject(function (Wallet) {
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(null, {});
      expect(ctrl.currentStep()).toBe('isx');
    }));

    it('should show a completed trade summary', inject(function (Wallet) {
      let trade = { state: 'completed' };
      Wallet.user.isEmailVerified = true;
      buySell.getExchange = () => ({ profile: {}, user: 1 });
      let ctrl = getController(null, trade);
      expect(ctrl.currentStep()).toBe('trade-complete');
    }));
  });
});
