describe "Completed Level directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  beforeEach module("walletApp")
  beforeEach(module('templates/completed-level.jade'))
  
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


