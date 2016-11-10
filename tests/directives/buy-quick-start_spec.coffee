fdescribe "buyQuickStart", ->
  $q = undefined
  scope = undefined
  element = undefined
  isoScope = undefined
  currency = undefined
  MyWallet = undefined
  buySell = undefined

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
