describe "Currency Picker", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<currency-picker></currency-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet currencies", inject((Wallet) ->
    expect(isoScope.currencies).toBe(Wallet.currencies)
    return
  )

  it "should select currency", ->
    isoScope.didSelect("a_currency")
    expect(isoScope.currency).toBe("a_currency")
    return
