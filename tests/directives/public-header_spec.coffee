describe "Public Header directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")
  # beforeEach module("shared")

  beforeEach inject((_$compile_, _$rootScope_) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
  )

  beforeEach ->
    element = ($compile)('<public-header></public-header>')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have access to the rootURL", ->
    expect(isoScope.rootURL).toBe('https://blockchain.info/')
