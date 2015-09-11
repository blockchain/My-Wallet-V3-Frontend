describe "Did You Know directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined
  DidYouKnow = undefined

  beforeEach module("walletApp")
  beforeEach(module("templates/did-you-know.jade"))

  beforeEach ->
    translateMock =
      instant: (string) ->
        string
    module(($provide) ->
      $provide.value("$translate",translateMock)
      return
    )
    inject ($injector) ->
      DidYouKnow = $injector.get("DidYouKnow")

  beforeEach inject((_$compile_, _$rootScope_) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    return
  )

  beforeEach ->
    element = $compile("<did-you-know></did-you-know>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "can randomize", ->
    expect(scope.getRandInRange).toBeDefined()

  it "fetches a random DidYouKnow with defined attributes", ->
    expect(scope.dyk.id).toBeDefined()
    expect(scope.dyk.icon).toBeTruthy()
