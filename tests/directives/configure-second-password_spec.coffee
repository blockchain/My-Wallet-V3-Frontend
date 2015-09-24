describe "Configure Second Password", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<configure-second-password></configure-second-password>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet settings", inject((Wallet) ->
    expect(isoScope.settings).toBe(Wallet.settings)
    return
  )

  it "should remove second password", inject((Wallet) ->
    spyOn(Wallet, "removeSecondPassword")
    isoScope.removeSecondPassword()
    expect(Wallet.removeSecondPassword).toHaveBeenCalled()

    return
  )

  it "covers setSecondPassword", ->
    isoScope.setSecondPassword()
    return
