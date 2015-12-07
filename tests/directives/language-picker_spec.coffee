describe "Language Picker", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
  )

  beforeEach ->
    element = $compile("<language-picker></language-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet languages", inject((languages) ->
    expect(isoScope.languages).toBe(languages)
  )

  it "should select language", ->
    isoScope.didSelect("a_language")
    expect(isoScope.language).toBe("a_language")
