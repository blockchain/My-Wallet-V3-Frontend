describe "Resend Email Confirmation", ->
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
    element = $compile("<resend-email-confirmation></resend-email-confirmation>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet user", inject((Wallet) ->
    expect(isoScope.user).toBe(Wallet.user)
    return
  )

  it "should resend email confirmation", inject((Wallet) ->
    spyOn(Wallet, "resendEmailConfirmation")
    isoScope.resendEmailConfirmation()
    expect(Wallet.resendEmailConfirmation).toHaveBeenCalled()

    return
  )
