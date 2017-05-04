describe "buySell service", () ->
  Wallet = undefined
  MyWallet = undefined
  buySell = undefined
  currency = undefined
  $rootScope = undefined
  $q = undefined
  $uibModal = undefined
  exchange = undefined
  Alerts = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$q_) ->
      $rootScope = _$rootScope_
      $q = _$q_
      $uibModal = $injector.get("$uibModal")
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Options = $injector.get("Options")
      Alerts = $injector.get("Alerts")

      Options.get = () ->
        Promise.resolve({
          "showBuySellTab": ["US"],
          "partners": {
            "coinify": {
              "countries": ["US"]
            }
          }
        })

      MyWallet.wallet =
        accountInfo:
          countryCodeGuess: {}
        hdwallet:
          accounts: [{label: ""}, {label: "2nd account"}]
          defaultAccount: {index: 0}

      buySell = $injector.get("buySell")
      currency = $injector.get("currency")

      Wallet.settings.currency = {code: 'EUR'}
      Wallet.status.isLoggedIn = true

  makeTrade = (state) ->
    state: state
    accountIndex: 0
    inCurrency: 'USD'
    bitcoinReceived: state == "completed"
    watchAddress: -> $q.resolve()
    refresh: -> $q.resolve()

  beforeEach ->
    exchange = buySell.getExchange()

    trades = ["processing", "completed", "completed_test", "cancelled"].map(makeTrade)

    spyOn(exchange, "getBuyCurrencies").and.returnValue($q.resolve(["USD", "EUR"]))
    spyOn(exchange, "getTrades").and.returnValue($q.resolve(trades))
    spyOn(exchange, "getKYCs").and.returnValue($q.resolve([]))

  describe "getTrades", ->
    beforeEach ->
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
      trades = pending: makeTrade("processing"), completed: makeTrade("completed")
      Object.keys(trades).forEach((t) -> spyOn(trades[t], 'watchAddress').and.callThrough())

    it "should watch if bitcoin has not been received", ->
      buySell.watchAddress(trades.pending)
      expect(trades.pending.watchAddress).toHaveBeenCalled()

    it "should open the buy modal when bitcoin is received", inject((modals) ->
      spyOn(modals, 'openBuyView')
      buySell.watchAddress(trades.pending)
      $rootScope.$digest()
      expect(modals.openBuyView).toHaveBeenCalled()
    )

  describe "fetchProfile", ->
    exchange = undefined
    fetchFailWith = undefined

    beforeEach ->
      exchange = buySell.getExchange()
      spyOn(exchange, "fetchProfile").and.callFake  ->
        if fetchFailWith? then $q.reject(fetchFailWith) else $q.resolve()
      spyOn(buySell, "getTrades").and.callThrough()

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

  describe "cancelTrade", ->
    trade = undefined
    beforeEach ->
      trade = { cancel: () -> }
      spyOn(Alerts, "displayError")

    it "should confirm before canceling", ->
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      buySell.cancelTrade(trade)
      expect(Alerts.confirm).toHaveBeenCalled()

    it "should not cancel if confirm was rejected", ->
      spyOn(trade, "cancel").and.returnValue($q.resolve())
      spyOn(Alerts, "confirm").and.returnValue($q.reject())
      buySell.cancelTrade(trade)
      $rootScope.$digest()
      expect(trade.cancel).not.toHaveBeenCalled()

    it "should show an error if the cancel fails", ->
      spyOn(trade, "cancel").and.returnValue($q.reject("ERROR_TRADE_CANCEL"))
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      buySell.cancelTrade(trade)
      $rootScope.$digest()
      expect(Alerts.displayError).toHaveBeenCalledWith("ERROR_TRADE_CANCEL")

  describe "openSellView", ->
    trade = undefined
    bankMedium = undefined
    payment = undefined
    beforeEach ->
      trade = { btc: 1, fiat: 100 }
      bankMedium = {
        getBankAccounts: () -> $q.resolve('something')
      }
      payment = { fee: 1 }
      exchange = buySell.getExchange()
      exchange.profile = { user: 1 }

    it "should call getExchange", ->
      result = buySell.openSellView(trade, bankMedium, payment)
      # expect(result).toEqual

  describe "isPendingSellTrade()", ->
    pendingTrade = undefined
    exchange = undefined
    beforeEach ->
      exchange = buySell.getExchange()
      pendingTrade = {
        state: 'awaiting_transfer_in'
        medium: 'blockchain'
      }

    it "should return true", ->
      result = buySell.isPendingSellTrade(pendingTrade)
      expect(result).toEqual(true)

  describe "getCurrency", ->
    trade = undefined
    sellCheck = undefined
    exchange = undefined
    beforeEach ->
      exchange = buySell.getExchange()
      trade = makeTrade('processing')
      trade.inCurrency = 'EUR'
      trade = null
      sellCheck = true

    it "should return EUR", ->
      result = buySell.getCurrency(trade, sellCheck)
      expect(result).toEqual({code: 'EUR'})
