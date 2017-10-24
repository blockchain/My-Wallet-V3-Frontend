describe('shift-create.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
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

  let mockDefaultBTCWallet = (invalid) =>
    ({
      label: 'My Bitcoin Wallet',
      coinCode: 'btc',
      getAvailableBalance: () => invalid ? $q.reject() : $q.resolve(1)
    });

  let mockDefaultETHWallet = () =>
    ({
      label: 'My Eth Wallet',
      coinCode: 'eth',
      getAvailableBalance: () => $q.resolve(1)
    });

  let handlers = {
    handleApproximateQuote () { return $q.resolve(mockQuote()); },
    handleQuote () { return $q.resolve(mockQuote()); },
    buildPayment () { return mockPayment(); },
    handleRate () { return $q.resolve(mockRate()); },
    onComplete () { return $q.resolve(); },
    fees: {'btc': 'priority'},
    wallets: [mockDefaultETHWallet(), mockDefaultBTCWallet()]
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

      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');
      let Exchange = $injector.get('Exchange');
      let MyWallet = $injector.get('MyWallet');
      let buyStatus = $injector.get('buyStatus');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');

      MyWallet.wallet = {
        accountInfo: {
          countryCodeGuess: 'US'
        }
      };
      Wallet.accounts = () => [];
      Wallet.api.incrementShapeshiftStat = () => {};
      Wallet.getDefaultAccount = () => mockDefaultBTCWallet();
      MyWallet.wallet.eth = { defaultAccount: mockDefaultETHWallet() };
      Exchange.interpretError = (err) => err;
      MyWalletHelpers.asyncOnce = function (f) {
        let async = () => f();
        async.cancel = function () {};
        return async;
      };

      buyStatus.canBuy = () => $q.resolve().then(scope.canBuy = true);
    }));

  describe('.getSendAmount()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
      scope.quote = mockQuote();
    });

    it('should busy the scope while getting send amount', () => {
      scope.getSendAmount();
      expect(scope.busy).toEqual(true);
      scope.$digest();
      expect(scope.busy).toEqual(false);
    });

    it('should set the baseCurr to the input currency', () => {
      scope.from = mockDefaultBTCWallet();
      scope.getSendAmount();
      expect(scope.state.baseCurr).toBe('btc');
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

  describe('.getQuoteArgs()', () => {
    beforeEach(() => scope = getControllerScope(handlers));

    it('should get args for a BTC->ETH quote', () => {
      scope.state.baseCurr = 'btc';
      scope.forms.shiftForm.input.$viewValue = 1;
      expect(scope.getQuoteArgs(scope.state).from.coinCode).toEqual(mockDefaultBTCWallet().coinCode);
    });
  });

  describe('.refreshQuote()', () => {
    beforeEach(() => scope = getControllerScope(handlers));

    describe('success', () => {
      let quote;

      beforeEach(function () {
        quote = mockQuote();
        let quoteP = $q.resolve(quote);
        spyOn(handlers, 'handleQuote').and.returnValue(quoteP);
        scope = getControllerScope(handlers);
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

      it('should set state.output.amount to quoteAmount if in baseInput', () => {
        scope.state.baseCurr = 'btc';
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

    describe('from', () => {
      it('should getAvailableBalance when balance changes', () => {
        spyOn(scope, 'getAvailableBalance');
        scope.$ctrl.from.balance = 100;
        scope.$digest();
        expect(scope.getAvailableBalance).toHaveBeenCalled();
      });
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
