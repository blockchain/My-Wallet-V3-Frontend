describe "sell-trade-finished.component", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  buySell = undefined
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined

  sellTrade = {
    id: '12345',
    state: 'awaiting_transfer_in',
    inCurrency: 'BTC',
    outCurrency: 'EUR',
    outAmountExpected: 100,
    transferIn: {
      sendAmount: '.01527447',
      medium: 'blockchain'
    }
    transferOut: {
      details: {
        account: {
          number: '123456789ABCDEFG'
        }
      }
    }
  }

  handlers =
    sellTrade: sellTrade


  getController = (bindings) ->
    scope = $rootScope.$new()
    ctrl = $componentController("sellTradeFinished", $scope: scope, bindings)
    template = $templateCache.get('partials/coinify/sell-trade-finished.pug')
    $compile(template)(scope)
    ctrl

  beforeEach module("walletApp")
  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) ->
      $rootScope = _$rootScope_
      $compile = _$compile_
      $templateCache = _$templateCache_
      $componentController = _$componentController_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")

  describe "btcSold", ->

    it "should equal the btc amount sold", ->
      ctrl = getController(handlers)
      ctrl.btcSold = ctrl.sellTrade.transferIn.sendAmount * 100000000
      expect(ctrl.btcSold).toEqual(1527447)

  describe ".showNote()", ->

    it "should change the country", ->
      ctrl = getController(handlers)
      result = ctrl.showNote()
      expect(result).toEqual(true)
  #
  describe ".tradeCompleted", ->

    beforeEach ->
      ctrl = undefined
      ctrl = getController(handlers)
      ctrl.sellTrade.state = 'completed'

    it "should be true if the state is 'completed'", ->
      ctrl = getController(handlers)
      expect(ctrl.tradeCompleted).toEqual(true)
