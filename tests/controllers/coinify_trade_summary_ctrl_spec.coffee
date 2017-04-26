describe "CoinifyTradeSummaryController", ->
  scope = undefined
  $rootScope = undefined
  $controller = undefined
  formatTrade = undefined
  $q = undefined
  
  trade =
    id: 1
    state: 'processing'
    medium: 'card'
    inCurrency: 'USD'
    outCurrency: 'BTC'
    refresh: () -> $q.resolve(trade)
    watchAddress: () -> $q.resolve()

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

      $q = $injector.get("$q")
      formatTrade = $injector.get("formatTrade")

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      trade: trade

    $controller "CoinifyTradeSummaryController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "state", ->

    it "should read the state from the trade", ->
      expect(scope.vm.trade.state).toBe('processing')
    
  describe "formattedTrade", ->
    
    it "should format a trade", ->
      expect(scope.formattedTrade).toBeDefined()
