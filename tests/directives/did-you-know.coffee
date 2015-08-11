describe "Did You Know directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined
  DidYouKnow = undefined

  beforeEach module("walletApp")
  beforeEach(module("templates/did-you-know.jade"))
  beforeEach module("walletServices")

  beforeEach ->

    translateMock =
      instant: (string) ->
        string

    module(($provide) ->
      $provide.value("$translate",translateMock)
      return
    )

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    DidYouKnow = $injector.get("DidYouKnow")
    return
  )

  beforeEach ->
    element = $compile("<div><did-you-know></did-you-know></div>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "can randomize", ->
    pending()

  it "fetches a random Did You Know", -> 
    pending()
