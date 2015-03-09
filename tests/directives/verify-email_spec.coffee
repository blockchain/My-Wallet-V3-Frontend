describe "Verify Email", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/verify-email.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.login("test", "test")

    return
  )

  beforeEach ->
    element = $compile("<verify-email></verify-email>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet settings", inject((Wallet) ->
    expect(isoScope.settings).toBe(Wallet.settings)
    return
  )

  it "should have wallet user", inject((Wallet) ->
    expect(isoScope.user).toBe(Wallet.user)
    return
  )

  it "should verify email", inject((Wallet) ->
    spyOn(Wallet, "verifyEmail")
    isoScope.verifyEmail('a_code')
    expect(Wallet.verifyEmail).toHaveBeenCalled()

    return
  )