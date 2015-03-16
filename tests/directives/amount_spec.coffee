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

    Wallet.login("test", "test")
    
    return
  )

  beforeEach ->
    element = $compile("<amount></amount>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should show btc if btc attribute is set", inject((Wallet) ->
    expect(isoScope.showBTC()).toBe(false)
    
    
    element = $compile("<amount btc></amount>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
    
    expect(isoScope.showBTC()).toBe(true)
    return
  )
  
  it "should show BTC if set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "BTC"}
    expect(isoScope.showBTC()).toBe(true)

    return
  )
  
  it "should show mBTC if set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "mBTC"}
    expect(isoScope.showMBTC()).toBe(true)

    return
  )
  
  it "should not show BTC if mBTC is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "mBTC"}
    expect(isoScope.showBTC()).toBe(false)

    return
  )
  
  it "should show fiat by default", ->
    expect(isoScope.settings.displayCurrency.code).toBe("USD")
  
  it "should toggle between fiat and BTC", inject((Wallet) ->
    isoScope.toggle()
    expect(isoScope.settings.displayCurrency.code).toBe("BTC")
  )
  
  it "should toggle between BTC and mBTC", inject((Wallet) ->
    isoScope.toggle()
    isoScope.toggle()
    expect(isoScope.settings.displayCurrency.code).toBe("mBTC")
  )
  
  it "should respond to toggle elsewhere", inject((Wallet) ->    
    isoScope.settings.displayCurrency = Wallet.currencies[1]
    expect(isoScope.settings.displayCurrency.code).toBe("EUR")
  ) 
  
  