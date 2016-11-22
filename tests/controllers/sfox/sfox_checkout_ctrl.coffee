
describe "SfoxCheckoutController", ->
  $rootScope = undefined
  $controller = undefined
  $compile = undefined
  $templateCache = undefined
  $q = undefined
  $timeout = undefined
  scope = undefined
  modals = undefined
  Alerts = undefined
  Wallet = undefined

  mockTrade = () -> 'TRADE'

  mockMediums = () ->
    ach:
      buy: () -> $q.resolve(mockTrade())

  mockQuote = (fail) ->
    quoteAmount: 123000
    getPaymentMediums: () -> if fail then $q.reject(fail) else $q.resolve(mockMediums())

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $compile = _$compile_
      $templateCache = _$templateCache_

      $q = $injector.get('$q')
      $timeout = $injector.get('$timeout')
      modals = $injector.get('modals')
      Alerts = $injector.get('Alerts')
      Wallet = $injector.get('Wallet')
      MyWalletHelpers = $injector.get('MyWalletHelpers')

      Wallet.getDefaultAccount = () -> {}
      MyWalletHelpers.asyncOnce = (f) => f

  getControllerScope = (accounts) ->
    scope = $rootScope.$new()
    scope.vm = external: { sfox:
      profile: { verificationStatus: level: "unverified" }
      getBuyQuote: () -> $q.resolve({})
    }
    template = $templateCache.get('partials/sfox/checkout.jade')
    $controller "SfoxCheckoutController",
      $scope: scope
      accounts: accounts || []
    $compile(template)(scope)
    scope

  it "should not initialize if there are no accounts", ->
    scope = getControllerScope()
    scope.$digest()
    expect(scope.state).not.toBeDefined()

  it "should set scope.openSfoxSignup on init", ->
    scope = getControllerScope([{status:'active'}])
    spyOn(modals, "openSfoxSignup")
    scope.openSfoxSignup()
    expect(modals.openSfoxSignup).toHaveBeenCalledWith(scope.vm.external.sfox)

  describe ".buy()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])
      scope.quote = mockQuote()

    it "should lock the scope while buying", ->
      scope.buy()
      expect(scope.locked).toEqual(true)
      scope.$digest()
      expect(scope.locked).toEqual(false)

    it "should refresh the quote after buying", ->
      spyOn(scope, 'refreshQuote')
      scope.buy()
      scope.$digest()
      expect(scope.refreshQuote).toHaveBeenCalled()

    it "should open the trade summary modal", ->
      spyOn(modals, "openTradeSummary")
      scope.buy()
      scope.$digest()
      expect(modals.openTradeSummary).toHaveBeenCalledWith('initiated', 'TRADE')

    it "should show an alert in case of error", ->
      spyOn(Alerts, "displayError")
      scope.quote = mockQuote('NETWORK_ERROR')
      scope.buy()
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalled()

  describe ".getQuoteArgs()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])

    it "should get args for a USD->BTC quote", ->
      scope.state.baseCurr = scope.dollars
      scope.state.fiat = 75
      expect(scope.getQuoteArgs(scope.state)).toEqual([7500, "USD", "BTC"])

    it "should get args for a BTC->USD quote", ->
      scope.state.baseCurr = scope.bitcoin
      scope.state.btc = 350000
      expect(scope.getQuoteArgs(scope.state)).toEqual([350000, "BTC", "USD"])

  describe ".cancelRefresh()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])

    it "should cancel the refresh timeout", ->
      spyOn($timeout, "cancel")
      scope.refreshTimeout = 'TIMEOUT'
      scope.cancelRefresh()
      expect($timeout.cancel).toHaveBeenCalledWith(scope.refreshTimeout)

  describe ".refreshQuote()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])

    it "should reset the quote amount and the refresh timeout", ->
      scope.state.quote = 100
      spyOn(scope, 'cancelRefresh')
      scope.refreshQuote()
      expect(scope.state.quote).toEqual(0)
      expect(scope.cancelRefresh).toHaveBeenCalled()

    it "should call exchange.getBuyQuote()", ->
      spyOn(scope.vm.external.sfox, "getBuyQuote")
      scope.refreshQuote()
      expect(scope.vm.external.sfox.getBuyQuote).toHaveBeenCalled()

    describe "success", ->
      quote = undefined

      beforeEach ->
        quote = mockQuote()
        quoteP = $q.resolve(quote)
        spyOn(scope.vm.external.sfox, "getBuyQuote").and.returnValue(quoteP)
        scope.refreshQuote()

      it "should set the new quote on the scope", ->
        scope.$digest()
        expect(scope.quote).toEqual(quote)

      it "should have loadFailed set to false", ->
        scope.$digest()
        expect(scope.state.loadFailed).toBeFalsy()

      it "should set state.btc to quoteAmount if in baseFiat", ->
        scope.state.baseCurr = scope.dollars
        scope.$digest()
        expect(scope.state.btc).toEqual(123000)

      it "should set state.fiat to quoteAmount if not in baseFiat", ->
        scope.state.baseCurr = scope.bitcoin
        scope.$digest()
        expect(scope.state.fiat).toEqual(1230)

    describe "failure", ->
      beforeEach ->
        errorP = $q.reject('ERROR')
        spyOn(scope.vm.external.sfox, "getBuyQuote").and.returnValue(errorP)
        scope.refreshQuote()
        scope.$digest()

      it "should have loadFailed set to true", ->
        expect(scope.state.loadFailed).toEqual(true)

  describe "$watchers", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])
      scope.$digest()
      spyOn(scope, "refreshIfValid")

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
