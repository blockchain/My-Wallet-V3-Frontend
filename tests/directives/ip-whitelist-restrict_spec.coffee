describe "IP Whitelist Restrict", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<ip-whitelist-restrict></ip-whitelist-restrict>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet settings", inject((Wallet) ->
    expect(isoScope.settings).toBe(Wallet.settings)
    return
  )

  it "should enable ip whitelist restrictions", inject((Wallet) ->
    spyOn(Wallet, "enableRestrictToWhiteListedIPs")
    isoScope.enableIpWhitelistRestrict()
    expect(Wallet.enableRestrictToWhiteListedIPs).toHaveBeenCalled()

    return
  )

  it "should disable ip whitelist restrictions", inject((Wallet) ->
    spyOn(Wallet, "disableRestrictToWhiteListedIPs")
    isoScope.disableIpWhitelistRestrict()
    expect(Wallet.disableRestrictToWhiteListedIPs).toHaveBeenCalled()

    return
  )
