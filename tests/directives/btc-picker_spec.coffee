describe "BTC Currency Picker", ->
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
    element = $compile("<btc-picker></btc-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet btc currencies", inject((Wallet) ->
    expect(isoScope.currencies).toBe(Wallet.btcCurrencies)
    return
  )

  it "should select currency", inject((Wallet) ->
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.currency).toBe(isoScope.currencies[1])
    return
  )

  it "should update the diplay currency if necessary", inject((Wallet) ->
    isoScope.displayCurrency = isoScope.currencies[0]
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.displayCurrency).toBe(isoScope.currencies[1])
    return
  )

  it "should not update the diplay currency if not necessary", inject((Wallet) ->
    isoScope.displayCurrency = Wallet.currencies[0]
    isoScope.didSelect(isoScope.currencies[1])
    expect(isoScope.displayCurrency).toBe(Wallet.currencies[0])
    return
  )
