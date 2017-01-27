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
  MyWallet = undefined
  sfox = undefined

  mockTrade = () ->
    id: 'TRADE'
    refresh: () ->
    watchAddress: () ->

  mockMediums = () ->
    ach:
      buy: () -> $q.resolve(mockTrade())

  mockQuote = (fail) ->
    quoteAmount: 150
    rate: 867
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
      MyWallet = $injector.get("MyWallet")
      MyWalletHelpers = $injector.get('MyWalletHelpers')
      sfox = $injector.get('sfox')

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

      currency = $injector.get("currency")
      currency.conversions["USD"] = { conversion: 2 }

  getControllerScope = (accounts) ->
    scope = $rootScope.$new()
    scope.vm = external: { sfox:
      profile:
        limits: buy: 100
        verificationStatus: level: "unverified"
      getBuyQuote: () -> $q.resolve(mockQuote())
      fetchProfile: () -> $q.resolve()
    }
    template = $templateCache.get('partials/sfox/checkout.jade')
    $controller "SfoxCheckoutController",
      $scope: scope
      accounts: accounts || []
    $compile(template)(scope)
    scope

  it "should set scope.openSfoxSignup on init", ->
    scope = getControllerScope([{status:'active'}])
    spyOn(modals, "openSfoxSignup").and.returnValue($q.resolve())
    scope.openSfoxSignup()
    expect(modals.openSfoxSignup).toHaveBeenCalledWith(scope.vm.external.sfox)

  describe ".buyHandler()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])

    it "should watch the trade for completion and close the first modal", ->
      dismissSpy = jasmine.createSpy("dismiss")
      spyOn(modals, "openTradeSummary").and.returnValue(dismiss: dismissSpy)
      spyOn(sfox, "watchTrade").and.callFake((trade, cb) -> cb())
      scope.buyHandler(mockQuote())
      scope.$digest()
      trade = jasmine.objectContaining({ id: "TRADE" })
      expect(sfox.watchTrade).toHaveBeenCalledWith(trade, jasmine.any(Function))
      expect(dismissSpy).toHaveBeenCalled()

    it "should open the trade summary modal", ->
      spyOn(modals, "openTradeSummary").and.callThrough()
      scope.buyHandler(mockQuote())
      scope.$digest()
      trade = jasmine.objectContaining({ id: "TRADE" })
      expect(modals.openTradeSummary).toHaveBeenCalledWith(trade, 'initiated')

    it "should show an alert in case of error", ->
      spyOn(Alerts, "displayError")
      scope.buyHandler(mockQuote('NETWORK_ERROR'))
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalled()
