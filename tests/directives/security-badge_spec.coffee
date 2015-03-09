describe "Security Badge", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/security-badge.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.login("test", "test")

    return
  )

  beforeEach ->
    element = $compile("<security-badge></security-badge>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have a badge url", ->
    expect(isoScope.badgeUrl).toBeDefined()
    return