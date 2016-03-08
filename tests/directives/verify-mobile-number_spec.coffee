describe "Verify Mobile Number Directive", ->
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
    element = $compile("<verify-mobile-number button-lg full-width></verify-mobile-number>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have text", ->
    expect(element.html()).toContain "VERIFY"

  it "can be verified", inject((Wallet) ->
    spyOn(Wallet, "verifyMobile")

    isoScope.verifyMobile("31 1 2345")

    expect(Wallet.verifyMobile).toHaveBeenCalled()

    return
  )



  return
