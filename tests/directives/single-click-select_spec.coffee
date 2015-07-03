describe "Click to highlight directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  $scope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()

    return
  )

  beforeEach ->
    element = $compile("<span single-click-select>some copy</span>")($rootScope)
    $rootScope.$digest()
    $scope.$apply()

  it "will initially not be highlighted", ->
    expect($scope.highlighted).toBe(false)

  it "can fire the select function", ->
    spyOn($scope, "select").and.callThrough()
    $scope.select()
    expect($scope.select).toHaveBeenCalled()
