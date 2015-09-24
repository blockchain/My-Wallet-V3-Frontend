describe "Language Picker", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<language-picker></language-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have wallet languages", inject((Wallet) ->
    expect(isoScope.languages).toBe(Wallet.languages)
    return
  )

  it "should select language", ->
    isoScope.didSelect("a_language")
    expect(isoScope.language).toBe("a_language")
    return
