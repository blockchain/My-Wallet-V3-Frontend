describe "Api Access", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/api-access.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.login("test", "test")

    return
  )

  beforeEach ->
    element = $compile("<api-access></api-access>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet settings", inject((Wallet) ->
    expect(isoScope.settings).toBe(Wallet.settings)
    return
  )

  it "should enable api access", inject((Wallet) ->
    spyOn(Wallet, "enableApiAccess")
    isoScope.enableApiAccess()
    expect(Wallet.enableApiAccess).toHaveBeenCalled()

    return
  )

  it "should disable api access", inject((Wallet) ->
    spyOn(Wallet, "disableApiAccess")
    isoScope.disableApiAccess()
    expect(Wallet.disableApiAccess).toHaveBeenCalled()

    return
  )