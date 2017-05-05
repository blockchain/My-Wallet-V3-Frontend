describe "TOR Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.settings_api =
      updateTorIpBlock: (value, success, error) ->
        success()

    return
  )

  beforeEach ->
    element = $compile("<tor></tor>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have text", ->
    expect(element.html()).toContain "BLOCK_TOR"

    it "has an initial status", ->
      expect(isoScope.settings.blockTOR).toBe(false)

    it "can be enabled", inject((Wallet) ->
      spyOn(Wallet, "enableBlockTOR").and.callThrough()
      isoScope.enableBlockTOR()
      expect(Wallet.enableBlockTOR).toHaveBeenCalled()
      expect(isoScope.settings.blockTOR).toBe(true)
    )

    it "can be disabled", inject((Wallet) ->
      spyOn(Wallet, "disableBlockTOR")
      isoScope.disableBlockTOR()
      expect(Wallet.disableBlockTOR).toHaveBeenCalled()
    )
