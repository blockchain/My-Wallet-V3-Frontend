describe "Completed Level directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<completed-level></completed-level>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "has a templateUrl", ->
    expect(isoScope.tooltip.templateUrl).toBeTruthy()

  it "has a placement", ->
    expect(isoScope.tooltip.placement).toBeTruthy()
