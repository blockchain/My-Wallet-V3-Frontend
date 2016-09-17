describe "Trade Directive", ->
  element = undefined
  isoScope = undefined
  Wallet = undefined
  Alerts = undefined
  $q = undefined

  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, $injector, _$q_) ->
    $q = _$q_
    Wallet = $injector.get("Wallet")
    MyWallet = $injector.get("MyWallet")
    Alerts = $injector.get("Alerts")

    MyWallet.wallet =
      external: {
        addCoinify: () ->
        coinify: {}
      }

    parentScope = $rootScope.$new()

    parentScope.trade =
      state: 'pending'
      bitcionReceived: false

    parentScope.buy = () ->

    html = "<trade trade='trade' buy='buy'></trade>"
    element = $compile(html)(parentScope)
    parentScope.$digest()
    isoScope = element.isolateScope()
  )

  it "should be passed a trade object", ->
    expect(isoScope.trade).toBeDefined()

  it "should be passed a buy function", ->
    expect(isoScope.buy).toBeDefined()

  describe "update()", ->
    it "should set the error state", ->
      isoScope.trade.state = "cancelled"
      isoScope.$digest()
      expect(isoScope.error).toEqual(true)

    it "should set the success state", ->
      isoScope.trade.state = "completed"
      isoScope.$digest()
      expect(isoScope.completed).toEqual(true)

    it "should set the pending state", ->
      isoScope.trade.state = "awaiting_transfer_in"
      isoScope.$digest()
      expect(isoScope.pending).toEqual(true)

    it "should set the completed state", ->
      isoScope.trade.state = "expired"
      isoScope.$digest()
      expect(isoScope.completed).toEqual(true)

  describe "cancel()", ->
    trade = undefined
    beforeEach ->
      trade = { cancel: () -> }
      spyOn(Alerts, "displayError")

    it "should confirm before canceling", ->
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      isoScope.cancel(trade)
      expect(Alerts.confirm).toHaveBeenCalled()

    it "should not cancel if confirm was rejected", ->
      spyOn(trade, "cancel").and.returnValue($q.resolve())
      spyOn(Alerts, "confirm").and.returnValue($q.reject())
      isoScope.cancel(trade)
      isoScope.$digest()
      expect(trade.cancel).not.toHaveBeenCalled()

    it "should show an error if the cancel fails", ->
      spyOn(trade, "cancel").and.returnValue($q.reject("ERROR_TRADE_CANCEL"))
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      isoScope.cancel(trade)
      isoScope.$digest()
      expect(Alerts.displayError).toHaveBeenCalledWith("ERROR_TRADE_CANCEL")

    it "should reset the scope status", ->
      spyOn(trade, "cancel").and.returnValue($q.resolve())
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      isoScope.cancel(trade)
      expect(isoScope.status.canceling).toEqual(true)
      isoScope.$digest()
      expect(isoScope.status.canceling).toEqual(false)
