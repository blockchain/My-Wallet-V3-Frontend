describe('shift-create.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let $timeout;
  let $q;
  let scope;
  let Wallet;

  let mockRate = () =>
    ({
      minimum: 0.00001,
      maxLimit: 2
    });

  let mockPayment = () =>
    ({
      quote: mockQuote(),
      getFee: () => $q.resolve(0.00001),
      payment: () => { return $q.resolve(); }
    });

  let mockQuote = () =>
    ({
      depositAddress: '16QBM4CxQAfyaX9mJw1iNmW9XCfWyexkHV',
      withdrawalAmount: 0.0015,
      depositAmount: '1',
      fromCurrency: 'btc',
      toCurrency: 'eth',
      minerFee: '0.005',
      expires: 1000,
      rate: '11'
    });

  let mockDefaultBTCWallet = () =>
    ({
      label: 'My Bitcoin Wallet',
      getAvailableBalance: () => $q.resolve(1)
    });

  let mockDefaultETHWallet = () =>
    ({
      label: 'My Eth Wallet',
      getAvailableBalance: () => $q.resolve(1)
    });

  let handlers = {
    handleApproximateQuote () { return $q.resolve(mockQuote()); },
    handleQuote () { return $q.resolve(mockQuote()); },
    buildPayment () { return mockPayment(); },
    handleRate () { return $q.resolve(mockRate()); },
    onComplete () { return $q.resolve(); }
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('shiftCreate', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/shapeshift/create.pug');
    $compile(template)(scope);
    return scope;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      $timeout = $injector.get('$timeout');
      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => mockDefaultBTCWallet();
      MyWallet.wallet.eth = {
        defaultAccount: mockDefaultETHWallet()
      };
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };
    }));

  describe('.getSendAmount()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
      scope.quote = mockQuote();
    });

    it('should lock the scope while getting send amount', () => {
      scope.getSendAmount();
      expect(scope.locked).toEqual(true);
      scope.$digest();
      expect(scope.locked).toEqual(false);
    });
  });

  describe('.refreshIfValid()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should refresh if field has amount', () => {
      spyOn(scope, 'refreshQuote');
      scope.state.input.amount = 1;
      scope.refreshIfValid('input');
      expect(scope.refreshQuote).toHaveBeenCalled();
    });
  });

  describe('.setTo()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should set the to field', () => {
      scope.setTo();
      console.log(scope.$ctrl.to);
    });
  });

  describe('.getQuoteArgs()', () => {
    beforeEach(() => scope = getControllerScope(handlers));

    it('should get args for a BTC->ETH quote', () => {
      scope.state.baseCurr = 'btc';
      scope.state.input = { curr: 'btc', amount: 1 };
      expect(scope.getQuoteArgs(scope.state)).toEqual({pair: 'btc_eth', amount: 1});
    });
  });

  describe('.cancelRefresh()', () => {
    beforeEach(() => scope = getControllerScope(handlers));

    it('should cancel the refresh timeout', () => {
      spyOn($timeout, 'cancel');
      scope.refreshTimeout = 'TIMEOUT';
      scope.cancelRefresh();
      expect($timeout.cancel).toHaveBeenCalledWith(scope.refreshTimeout);
    });
  });

  describe('.refreshQuote()', () => {
    beforeEach(() => scope = getControllerScope(handlers));

    it('should reset the refresh timeout', () => {
      spyOn(scope, 'cancelRefresh');
      scope.refreshQuote();
      expect(scope.cancelRefresh).toHaveBeenCalled();
    });

    describe('success', () => {
      let quote;

      beforeEach(function () {
        quote = mockQuote();
        let quoteP = $q.resolve(quote);
        spyOn(handlers, 'handleQuote').and.returnValue(quoteP);
        scope = getControllerScope(handlers);
        scope.state.baseCurr = 'btc';
        return scope.refreshQuote();
      });

      it('should set the new quote on the scope', () => {
        scope.$digest();
        expect(scope.quote).toEqual(quote);
      });

      it('should have loadFailed set to false', () => {
        scope.$digest();
        expect(scope.state.loadFailed).toBeFalsy();
      });

      it('should set state.input.amount to quoteAmount if in baseInput', () => {
        scope.$digest();
        expect(scope.state.output.amount).toEqual(0.0015);
      });
    });

    describe('failure', () => {
      beforeEach(function () {
        let errorP = $q.reject('ERROR');
        spyOn(handlers, 'handleApproximateQuote').and.returnValue(errorP);
        scope = getControllerScope(handlers);
        scope.refreshQuote();
        return scope.$digest();
      });

      it('should have loadFailed set to true', () => expect(scope.state.loadFailed).toEqual(true));
    });
  });

  describe('$watchers', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
      scope.$digest();
      spyOn(scope, 'refreshIfValid');
    });

    describe('input', () => {
      it('should not refresh if base fiat', () => {
        scope.state.input = { curr: 'btc', amount: 20000 };
        scope.state.baseCurr = 'eth';
        scope.$digest();
        expect(scope.refreshIfValid).not.toHaveBeenCalled();
      });

      it('should refresh if not base fiat', () => {
        scope.state.input = { curr: 'btc', amount: 20000 };
        scope.state.baseCurr = 'btc';
        scope.$digest();
        expect(scope.refreshIfValid).toHaveBeenCalled();
      });
    });
  });
});
