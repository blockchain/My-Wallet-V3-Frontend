describe "buy-checkout.component", ->
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined
  $timeout = undefined
  $q = undefined
  scope = undefined
  Wallet = undefined
  sfox = undefined

  mockTrade = () ->
    id: 'TRADE'
    refresh: () -> $q.resolve()
    watchAddress: () -> $q.resolve()

  mockMediums = () ->
    ach:
      buy: () -> $q.resolve(mockTrade())

  mockQuote = (fail) ->
    quoteAmount: 150
    rate: 867
    getPaymentMediums: () -> if fail then $q.reject(fail) else $q.resolve(mockMediums())

  handlers =
    handleQuote: () -> $q.resolve(mockQuote())
    buySuccess: () -> $q.resolve()
    buyError: () -> $q.resolve()

  getControllerScope = (bindings) ->
    scope = $rootScope.$new(true)
    ctrl = $componentController("buyCheckout", $scope: scope, bindings)
    template = $templateCache.get('templates/buy-checkout.jade')
    $compile(template)(scope)
    scope

  beforeEach module("walletApp")
  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) ->
      $rootScope = _$rootScope_
      $compile = _$compile_
      $templateCache = _$templateCache_
      $componentController = _$componentController_

      $timeout = $injector.get('$timeout')
      $q = $injector.get('$q')
      Wallet = $injector.get('Wallet')
      MyWallet = $injector.get("MyWallet")
      MyWalletHelpers = $injector.get('MyWalletHelpers')
      sfox = $injector.get('sfox')
      currency = $injector.get("currency")

      MyWallet.wallet = {}
      Wallet.accounts = () -> []
      Wallet.getDefaultAccount = () -> {}
      MyWalletHelpers.asyncOnce = (f) ->
        async = () -> f()
        async.cancel = () ->
        return async

      MyWallet.wallet.external =
        sfox:
          profile: {}

      currency.conversions["USD"] = { conversion: 2 }

  describe "gen", ->
    beforeEach ->
      scope = getControllerScope(handlers)

    describe ".enableBuy()", ->
      it "should enable buy()", ->
        scope.enableBuy()
        expect(scope.enabled).toBe(true)

    describe ".disableBuy()", ->
      it "should disable buy()", ->
        scope.disableBuy()
        expect(scope.enabled).toBe(false)

  it "should get an initial quote but only set the rate", ->
    scope = getControllerScope(handlers)
    scope.$digest()
    expect(scope.quote).not.toBeDefined()
    expect(scope.state.rate).toEqual(mockQuote().rate)

  describe "hasMultipleAccounts", ->
    it "should be false for one account", ->
      spyOn(Wallet, "accounts").and.returnValue([{active: true}])
      scope = getControllerScope(handlers)
      expect(scope.hasMultipleAccounts).toEqual(false)

    it "should be true for more than one account", ->
      spyOn(Wallet, "accounts").and.returnValue([{active: true}, {active: true}])
      scope = getControllerScope(handlers)
      expect(scope.hasMultipleAccounts).toEqual(true)

  describe ".buy()", ->
    beforeEach ->
      scope = getControllerScope(handlers)
      scope.quote = mockQuote()

    it "should lock the scope while buying", ->
      scope.buy()
      expect(scope.locked).toEqual(true)
      scope.$digest()
      expect(scope.locked).toEqual(false)

    it "should reset the form fields after buying", ->
      spyOn(scope, "resetFields")
      scope.buy()
      scope.$digest()
      expect(scope.resetFields).toHaveBeenCalled()

    it "should disable buy again", ->
      spyOn(scope, "disableBuy")
      scope.buy()
      scope.$digest()
      expect(scope.disableBuy).toHaveBeenCalled()

  describe ".getQuoteArgs()", ->
    buildArgs = (args) -> amount: args[0], baseCurr: args[1], quoteCurr: args[2]

    beforeEach ->
      scope = getControllerScope(handlers)

    it "should get args for a USD->BTC quote", ->
      scope.state.baseCurr = scope.dollars
      scope.state.fiat = 150
      expect(scope.getQuoteArgs(scope.state)).toEqual(buildArgs [7500, "USD", "BTC"])

    it "should get args for a BTC->USD quote", ->
      scope.state.baseCurr = scope.bitcoin
      scope.state.btc = 350000
      expect(scope.getQuoteArgs(scope.state)).toEqual(buildArgs [350000, "BTC", "USD"])

    it "should get the correct fiat arg with a number js has trouble with", ->
      scope.state.baseCurr = scope.dollars
      scope.state.fiat = 2.2
      expect(scope.getQuoteArgs(scope.state)).toEqual(buildArgs [110, "USD", "BTC"])

  describe ".cancelRefresh()", ->
    beforeEach ->
      scope = getControllerScope(handlers)

    it "should cancel the refresh timeout", ->
      spyOn($timeout, "cancel")
      scope.refreshTimeout = 'TIMEOUT'
      scope.cancelRefresh()
      expect($timeout.cancel).toHaveBeenCalledWith(scope.refreshTimeout)

  describe ".refreshQuote()", ->
    beforeEach ->
      scope = getControllerScope(handlers)

    it "should reset the refresh timeout", ->
      spyOn(scope, 'cancelRefresh')
      scope.refreshQuote()
      expect(scope.cancelRefresh).toHaveBeenCalled()

    it "should call exchange.getBuyQuote()", ->
      spy = jasmine.createSpy('quote').and.returnValue($q.resolve(mockQuote()))
      scope = getControllerScope(handleQuote: spy)
      scope.refreshQuote()
      expect(spy).toHaveBeenCalledWith(amount: 0, baseCurr: "USD", quoteCurr: "BTC")

    describe "success", ->
      quote = undefined

      beforeEach ->
        quote = mockQuote()
        quoteP = $q.resolve(quote)
        spyOn(handlers, "handleQuote").and.returnValue(quoteP)
        scope = getControllerScope(handlers)
        scope.state.btc = 1
        scope.refreshQuote()

      it "should set the new quote on the scope", ->
        scope.$digest()
        expect(scope.quote).toEqual(quote)

      it "should set the quote rate to the scope state", ->
        scope.$digest()
        expect(scope.state.rate).toEqual(mockQuote().rate)

      it "should have loadFailed set to false", ->
        scope.$digest()
        expect(scope.state.loadFailed).toBeFalsy()

      it "should set state.btc to quoteAmount if in baseFiat", ->
        scope.state.baseCurr = scope.dollars
        scope.$digest()
        expect(scope.state.btc).toEqual(150)

      it "should set state.fiat to quoteAmount if not in baseFiat", ->
        scope.state.baseCurr = scope.bitcoin
        scope.$digest()
        expect(scope.state.fiat).toEqual(3)

    describe "failure", ->
      beforeEach ->
        errorP = $q.reject('ERROR')
        spyOn(handlers, "handleQuote").and.returnValue(errorP)
        scope = getControllerScope(handlers)
        scope.refreshQuote()
        scope.$digest()

      it "should have loadFailed set to true", ->
        expect(scope.state.loadFailed).toEqual(true)

  describe ".setLimits()", ->
    beforeEach ->
      scope = getControllerScope(handlers)
      scope.$digest()

    it "should set max min limits", ->
      scope.setLimits(100)
      expect(scope.min).toBe(1)
      expect(scope.max).toBe(200)

  describe "$watchers", ->
    beforeEach ->
      scope = getControllerScope(handlers)
      scope.$digest()
      spyOn(scope, "refreshIfValid")
      spyOn(scope, "setLimits")

    describe "fiat", ->
      it "should refresh if base fiat", ->
        scope.state.fiat = 20
        scope.state.baseCurr = scope.dollars
        scope.$digest()
        expect(scope.refreshIfValid).toHaveBeenCalled()

      it "should not refresh if not base fiat", ->
        scope.state.fiat = 20
        scope.state.baseCurr = scope.bitcoin
        scope.$digest()
        expect(scope.refreshIfValid).not.toHaveBeenCalled()

    describe "btc", ->
      it "should not refresh if base fiat", ->
        scope.state.btc = 200000
        scope.state.baseCurr = scope.dollars
        scope.$digest()
        expect(scope.refreshIfValid).not.toHaveBeenCalled()

      it "should refresh if not base fiat", ->
        scope.state.btc = 200000
        scope.state.baseCurr = scope.bitcoin
        scope.$digest()
        expect(scope.refreshIfValid).toHaveBeenCalled()
