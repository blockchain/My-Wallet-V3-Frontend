describe "Amount", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")
  beforeEach module("templates/amount.jade")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.login("test", "test")

    return
  )

  beforeEach ->
    element = $compile("<amount></amount>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have scope.btc", inject((Wallet) ->
    expect(isoScope.btc).toBeDefined()
    return
  )