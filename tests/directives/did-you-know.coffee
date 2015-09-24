describe "Did You Know directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined
  DidYouKnow = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    DidYouKnow = $injector.get("DidYouKnow")
    return
  )

  beforeEach ->
    element = $compile("<did-you-know></did-you-know>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "can randomize", ->
    pending()
    # expect(scope.getRandInRange).toBeDefined()

  it "fetches a random DidYouKnow with defined attributes", ->
    pending()
    # expect(scope.dyk.id).toBeDefined()
    # expect(scope.dyk.icon).toBeTruthy()
