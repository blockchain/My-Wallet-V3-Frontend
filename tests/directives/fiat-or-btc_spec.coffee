describe "Amount", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<fiat-or-btc></fiat-or-btc>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should not show Fiat if BTC is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "BTC"}
    isoScope.updateDisplay()
    expect(isoScope.isBitCurrency(isoScope.currency)).toBe(true)
  )

  it "should show Fiat if BTC is not set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: "USD"}
    isoScope.updateDisplay()
    expect(isoScope.isBitCurrency(isoScope.currency)).toBe(false)
  )
