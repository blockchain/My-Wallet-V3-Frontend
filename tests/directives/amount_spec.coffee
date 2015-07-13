describe "Amount", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/amount.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    
    return
  )

  beforeEach ->
    element = $compile("<amount></amount>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  
  it "should not show Fiat if BTC is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "BTC"}
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(true)

    return
  )

  it "should show Fiat if BTC is not set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "USD"}
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(false)

    return
  )
  
  it "should toggle between Fiat and BTC", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "USD"}
    Wallet.settings.currency = {code: "USD"}
    Wallet.settings.btcCurrency = {code: "BTC"}
    isoScope.toggle()
    expect(isoScope.settings.displayCurrency.code).toBe("BTC")
  )
  
  it "should toggle between BTC and Fiat", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "BTC"}
    Wallet.settings.currency = {code: "USD"}
    Wallet.settings.btcCurrency = {code: "BTC"}
    isoScope.toggle()
    expect(isoScope.settings.displayCurrency.code).toBe("USD")
  )
  
  it "should respond to toggle elsewhere", inject((Wallet) ->    
    isoScope.settings.displayCurrency = Wallet.currencies[1]
    expect(isoScope.settings.displayCurrency.code).toBe("EUR")
  ) 
  
  