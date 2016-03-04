describe "Watch Only Address Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<div on-enter></div>")($rootScope)
    $rootScope.$digest()

  it "should be defined with an element", ->
    expect(element).toBeDefined()