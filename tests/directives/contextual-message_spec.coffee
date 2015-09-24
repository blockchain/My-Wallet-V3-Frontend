describe "Contextual message directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    Wallet = $injector.get("Wallet")
    SecurityCenter = $injector.get("SecurityCenter")
    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet = {
      balanceActiveLegacy: 100000000
      keys: [{ archived: false }, { archived: true }]
      hdwallet: {
        accounts: [{ archived: false }, { archived: false }, { archived: true }]
      }
    }
    return
  )

  beforeEach ->
    element = $compile("<div style='height: 100px;'><contextual-message></contextual-message></div>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "has a 2 preset messages", ->
    expect(scope.presets.length).toEqual(2)

  it "originally does not reveal a msg", ->
    expect(scope.reveal).toBe(false)

  it "should be able to reveal the message", ->
    spyOn(scope, "revealMsg").and.callThrough()
    scope.revealMsg()
    expect(scope.reveal).toBe(true)

  it "should show msg if there's more than .2BTC and a bad security center score", ->
    pending()
    expect(element.html()).toContain 'translate="NO_THANKS"'
