describe "Currency Picker", ->
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
    element = $compile("<currency-picker></currency-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet currencies", inject((currency) ->
    expect(isoScope.currencies).toBe(currency.currencies)
  )

  it "should select currency", ->
    isoScope.didSelect("a_currency")
    expect(isoScope.currency).toBe("a_currency")
