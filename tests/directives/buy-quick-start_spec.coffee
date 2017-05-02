describe "buyQuickStart", ->
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
    
    limits =
      bank:
        min:
          'EUR': 10
        max:
          'EUR': 1000
      card:
        min:
          'EUR': 10
        max:
          'EUR': 1000

    buySell = $injector.get("buySell")
    currency = $injector.get("currency")

    buySell.getExchange = () ->
      profile: {}
      user: {}
      getBuyQuote: -> $q.resolve([])
    
    buySell.getMinLimits = () -> $q.resolve(limits)
    buySell.cancelTrade = () -> $q.resolve(trade)
    buySell.getQuote = () -> $q.resolve(quote)
    
    mediums =
      'card':
        getAccounts: () -> $q.resolve([])
      'bank':
        getAccounts: () -> $q.resolve([])
    
    quote =
      quoteAmount: 1
      baseAmount: -100
      baseCurrency: 'USD'
      paymentMediums: mediums
      getPaymentMediums: () -> $q.resolve(mediums)

    element = $compile("<buy-quick-start transaction='transaction' currency-symbol='currencySymbol'></buy-quick-start>")(scope)
    scope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )
  
  describe ".updateLastInput()", ->
    
    it "should update last input field", ->
      isoScope.updateLastInput('btc')
      expect(isoScope.lastInput).toBe('btc')
      isoScope.updateLastInput('fiat')
      expect(isoScope.lastInput).toBe('fiat')

  describe ".getQuote()", ->
    
    it "should get a quote based on last input", ->
      spyOn(buySell, 'getQuote')
      isoScope.transaction.fiat = 1
      isoScope.transaction.currency = {code: 'USD'}
      isoScope.getQuote()
      expect(buySell.getQuote).toHaveBeenCalledWith(1, 'USD')
      isoScope.transaction.btc = 1
      isoScope.transaction.currency = {code: 'USD'}
      isoScope.updateLastInput('btc')
      isoScope.getQuote()
      expect(buySell.getQuote).toHaveBeenCalledWith(-1, 'BTC', 'USD')
    
  describe ".cancelTrade()", ->
    
    it "should cancel a trade", ->
      spyOn(buySell, 'cancelTrade')
      isoScope.cancelTrade()
      expect(buySell.cancelTrade).toHaveBeenCalled()
      isoScope.$digest()
      expect(isoScope.disabled).toBe(false)
