describe "BTC Currency Picker", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
  )

  beforeEach ->
    element = $compile("<btc-picker></btc-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet btc currencies", inject((currency) ->
    expect(isoScope.currencies).toBe(currency.bitCurrencies)
  )

  it "should select currency", inject(() ->
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.currency).toBe(isoScope.currencies[1])
  )

  it "should update the diplay currency if necessary", inject(() ->
    isoScope.displayCurrency = isoScope.currencies[0]
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.displayCurrency).toBe(isoScope.currencies[1])
  )

  it "should not update the diplay currency if not necessary", inject((currency) ->
    isoScope.displayCurrency = currency.currencies[0]
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.displayCurrency).toBe(currency.currencies[0])
  )
