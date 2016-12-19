describe "buyQuickStart", ->
  $q = undefined
  scope = undefined
  element = undefined
  isoScope = undefined
  currency = undefined
  MyWallet = undefined
  buySell = undefined
  modals = undefined

  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, $injector, _$q_) ->
    $q = _$q_
    scope = $rootScope.$new()
    scope.transaction = {
      'fiat': 1,
      'currency': {'code': 'USD'}
    }
    scope.exchangeRate = {fiat: 0}

    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet =
      external:
        coinify:
          getBuyQuote: -> $q.resolve([])

    buySell = $injector.get("buySell")
    currency = $injector.get("currency")
    modals = $injector.get("modals")

    buySell.getExchange = () ->
      profile: {}
      user: {}
      getBuyQuote: -> $q.resolve([])

    element = $compile("<buy-quick-start transaction='transaction' currency-symbol='currencySymbol'></buy-quick-start>")(scope)
    scope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  describe "getQuote", ->
    it "should get a quote", ->
      spyOn(buySell, 'getQuote').and.callThrough()
      isoScope.transaction.fiat = undefined
      isoScope.transaction.btc = 1
      isoScope.getExchangeRate()
      expect(buySell.getQuote).toHaveBeenCalled()

  describe "modalOpen watcher", ->
    it "should call getQuote when modal is closed", ->
      spyOn(isoScope, 'getQuote')
      isoScope.modalOpen = true
      isoScope.$digest()
      isoScope.modalOpen = false
      isoScope.$digest()
      expect(isoScope.getQuote).toHaveBeenCalled()

  describe "openVerificationNeeded", ->
    it "should calculate the correct number of days", ->
      spyOn(modals, "openTemplate")
      spyOn(Date, "now").and.returnValue(new Date('12/20/2016'))
      spyOn(buySell, "getExchange").and.returnValue
        profile: { canTradeAfter: new Date('1/1/2017') }
      isoScope.openVerificationNeeded()
      expect(modals.openTemplate).toHaveBeenCalledWith('partials/verification-needed-modal.jade', { days: 12 }, { windowClass: 'bc-modal sm'})
