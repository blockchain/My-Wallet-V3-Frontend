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

    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet =
      external:
        coinify:
          getBuyQuote: -> $q.resolve([])

    buySell = $injector.get("buySell")
    currency = $injector.get("currency")

    buySell = {
      getQuote: () ->
    }

    element = $compile("<buy-quick-start transaction='transaction' currency-symbol='currencySymbol'></buy-quick-start>")(scope)
    scope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  it "should have a status ready", ->
    expect(isoScope.status.ready).toBe(true)
