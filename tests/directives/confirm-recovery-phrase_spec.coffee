describe "Confirm Recovery Phrase", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/confirm-recovery-phrase.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.login("test", "test")

    return
  )

  beforeEach ->
    element = $compile("<confirm-recovery-phrase></confirm-recovery-phrase>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet status", inject((Wallet) ->
    expect(isoScope.status).toBe(Wallet.status)
    return
  )