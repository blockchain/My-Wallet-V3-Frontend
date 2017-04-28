describe "CoinifyTradeSummaryController", ->
  $q = undefined
  scope = undefined
  $rootScope = undefined
  $controller = undefined
  formatTrade = undefined
  
  trade =
    id: 1
    state: 'completed'
    inCurrency: 'USD'
    outCurrency: 'BTC'
    refresh: () -> $q.resolve(trade)
    watchAddress: () -> $q.resolve()
    fakeBankTransfer: () -> $q.resolve()

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_
      
      formatTrade = $injector.get('formatTrade')

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      trade: trade
      buySellDebug: true

    $controller "CoinifyTradeSummaryController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".fakeBankTransfer()", ->

    it "should fake a bank transfer", ->
      spyOn(scope.vm.trade, 'fakeBankTransfer')
      scope.fakeBankTransfer()
      expect(scope.vm.trade.fakeBankTransfer).toHaveBeenCalled()
      
    it "should format a trade", ->
      spyOn(formatTrade, 'processing')
      scope.fakeBankTransfer()
      scope.$digest()
      expect(formatTrade.processing).toHaveBeenCalledWith(trade)
