describe "Contextual message directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined

  beforeEach module("walletApp")
  beforeEach(module("templates/contextual-message.jade"))

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    Wallet = $injector.get("Wallet")
    SecurityCenter = $injector.get("SecurityCenter")

    return
  )

  beforeEach ->
    element = $compile("<contextual-message></contextual-message>")($rootScope)
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
