describe "SfoxBuyController", ->
  scope = undefined
  MyWallet = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  Alerts = undefined
  sfox = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  mockTrade = () ->
    id: 'TRADE'
    refresh: () ->
    watchAddress: () ->

  mockMediums = () ->
    ach:
      buy: () -> $q.resolve(mockTrade())
      getAccounts: () -> $q.resolve([])

  mockQuote = (fail) ->
    quoteAmount: 150
    rate: 867
    getPaymentMediums: () -> if fail then $q.reject(fail) else $q.resolve(mockMediums())

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      MyWallet = $injector.get("MyWallet")
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")
      sfox = $injector.get("sfox")

      MyWallet.wallet = {}
      MyWallet.wallet.external =
        sfox:
          profile: {}

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      goTo: () ->
      exchange:
        fetchProfile: () -> $q.resolve()
        getBuyMethods: () -> $q.resolve(mockMediums())
        profile:
          limits:
            buy: 100

    $controller "SfoxBuyController",
      $scope: scope
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".quoteHandler()", ->
    it "should fetch a quote", ->
      spyOn(sfox, "fetchQuote")
      scope.quoteHandler()
      expect(sfox.fetchQuote).toHaveBeenCalled()

  describe ".setState()", ->
    it "should set buyLimit", ->
      scope.setState()
      expect(scope.state.buyLimit).toBeDefined()

  describe ".buyHandler()", ->
    beforeEach ->
      scope = getControllerScope([{status:'active'}])

    it "should watch the trade for completion", ->
      spyOn(sfox, "watchTrade")
      scope.buyHandler(mockQuote())
      scope.$digest()
      expect(sfox.watchTrade).toHaveBeenCalled()

    it "should show an alert in case of error", ->
      spyOn(Alerts, "displayError")
      scope.buyHandler(mockQuote('NETWORK_ERROR'))
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalled()
