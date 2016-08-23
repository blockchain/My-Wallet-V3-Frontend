describe "buySell service", () ->
  Wallet = undefined
  MyWallet = undefined
  buySell = undefined
  currency = undefined
  $rootScope = undefined
  $q = undefined
  $uibModal = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$q_) ->
      $rootScope = _$rootScope_
      $q = _$q_
      $uibModal = $injector.get("$uibModal")
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet =
        accountInfo:
          countryCodeGuess: {}
        hdwallet:
          accounts: [{ label: "" }]
        external:
          coinify:
            getTrades: -> $q.resolve([])
            fetchProfile: ->
            getBuyCurrencies: -> $q.resolve(["USD", "EUR"])
            getKYCs: -> $q.resolve([])

      buySell = $injector.get("buySell")
      currency = $injector.get("currency")

  makeTrade = (state) ->
    state: state
    bitcoinReceived: state == "completed"
    watchAddress: -> $q.resolve()

  describe "getTrades", ->
    exchange = undefined
    trades = ["processing", "completed", "completed_test", "cancelled"].map(makeTrade)

    beforeEach ->
      exchange = buySell.getExchange()
      spyOn(exchange, "getTrades").and.returnValue($q.resolve(trades))
      spyOn(buySell, "watchAddress").and.returnValue($q.resolve())

    it "should call exchange.getTrades", ->
      buySell.getTrades()
      expect(exchange.getTrades).toHaveBeenCalled()

    it "should sort the trades into pending and completed arrays", ->
      buySell.getTrades()
      $rootScope.$digest()
      expect(buySell.trades.pending.length).toEqual(1)
      expect(buySell.trades.completed.length).toEqual(3)

    it "should watch completed trades and be initialized", ->
      buySell.getTrades()
      $rootScope.$digest()
      expect(buySell.watchAddress).toHaveBeenCalledTimes(1)

  describe "watchAddress", ->
    trades = {}

    beforeEach ->
      trades = pending: makeTrade("pending"), completed: makeTrade("completed")
      Object.keys(trades).forEach((t) -> spyOn(trades[t], 'watchAddress').and.callThrough())

    it "should watch if bitcoin has not been received", ->
      buySell.watchAddress(trades.pending)
      expect(trades.pending.watchAddress).toHaveBeenCalled()

    it "should open the buy modal when bitcoin is received", ->
      spyOn(buySell, 'openBuyView')
      buySell.watchAddress(trades.pending)
      $rootScope.$digest()
      expect(buySell.openBuyView).toHaveBeenCalled()

  describe "fetchProfile", ->
    exchange = undefined
    fetchFailWith = undefined

    beforeEach ->
      exchange = buySell.getExchange()
      spyOn(buySell, "getTrades").and.callThrough()
      spyOn(exchange, "fetchProfile").and.callFake  ->
        if fetchFailWith? then $q.reject(fetchFailWith) else $q.resolve()

    it "should call getTrades when successful", ->
      buySell.fetchProfile()
      $rootScope.$digest()
      expect(buySell.getTrades).toHaveBeenCalled()

    it "should call updateCoinifyCurrencies when successful", ->
      spyOn(currency, "updateCoinifyCurrencies")
      buySell.fetchProfile()
      $rootScope.$digest()
      expect(currency.updateCoinifyCurrencies).toHaveBeenCalledWith(["USD", "EUR"])

    it "should reject with the error if there is one", ->
      fetchFailWith = JSON.stringify(error: 'some_err')
      buySell.fetchProfile().catch((e) -> expect(e).toEqual('SOME_ERR'))
      $rootScope.$digest()
      expect(buySell.getTrades).not.toHaveBeenCalled()

    it "should reject default error if error is not json", ->
      fetchFailWith = 'unknown_err'
      buySell.fetchProfile().catch((e) -> expect(e).toEqual('INVALID_REQUEST'))
      $rootScope.$digest()
      expect(buySell.getTrades).not.toHaveBeenCalled()

  describe "openBuyView", ->
    exchange = undefined

    beforeEach ->
      exchange = buySell.getExchange()
      trades = ["processing", "completed", "cancelled"].map(makeTrade)
      spyOn(exchange, "getTrades").and.returnValue($q.resolve(trades))
      spyOn($uibModal, 'open')

    it "should open if there are trades", ->
      buySell.getTrades()
      buySell.openBuyView()
      expect($uibModal.open).toHaveBeenCalled()

    it "should get the trades before opening if user exists but there are no trades", ->
      exchange.user = true
      buySell.openBuyView()
      $rootScope.$digest()
      expect($uibModal.open).toHaveBeenCalled()

    it "should open otherwise", ->
      buySell.openBuyView()
      expect($uibModal.open).toHaveBeenCalled()
