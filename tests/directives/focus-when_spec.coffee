describe "Focus when directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  $scope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, _$window_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    $window = _$window_
    $scope = $rootScope.$new()

    return
  )

  beforeEach ->
    element = $compile("<span focus-when='true'>some copy</span>")($rootScope)
    $rootScope.$digest()
    $scope.$apply()

  it "can be focused", ->
    spyOn(element[0], 'focus').and.callThrough()
    element[0].focus()
    expect(element[0].focus).toHaveBeenCalled()