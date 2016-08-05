describe "Public Header directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("sharedDirectives")

  beforeEach inject((_$compile_, _$rootScope_) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    $rootScope.rootURL = 'blockchain.info'

    return
  )

  beforeEach ->
    element = ($compile)('<public-header></public-header')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "shold have access to the rootURL", ->
    expect(isoScope.rootURL).toBe('blockchain.info')
