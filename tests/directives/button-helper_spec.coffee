describe "Helper Text Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<helper-button></helper-button>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "has an initial status", ->
    expect(isoScope.isActive).toBe(false)

  it "can toggle status", ->
    spyOn(isoScope, "toggleActive").and.callThrough()
    isoScope.toggleActive()
    expect(isoScope.toggleActive).toHaveBeenCalled()
    expect(isoScope.isActive).toBe(true)

  it "has a templateUrl", ->
    expect(isoScope.helperText.templateUrl).toBeTruthy()
