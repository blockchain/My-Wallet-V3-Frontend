describe "Amount", ->
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
    element = $compile("<amount></amount>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should not show Fiat if BTC is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "BTC"}
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(true)
  )

  it "should show Fiat if BTC is not set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "USD"}
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(false)
  )

  it "should respond to toggle elsewhere", inject((currency) ->
    isoScope.settings.displayCurrency = currency.currencies[1]
    expect(isoScope.settings.displayCurrency.code).toBe("EUR")
  )
