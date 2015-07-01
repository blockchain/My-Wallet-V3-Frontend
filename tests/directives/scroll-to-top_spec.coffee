describe "Scroll To Top Directive", ->
  $compile = undefined
  $rootScope = undefined
  $scope = undefined
  element = undefined

  beforeEach module("walletApp")
  beforeEach(module('partials/common.jade'))

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()

    return
  )

  beforeEach ->
    element = $compile("<div></div>")($rootScope)
    $rootScope.$digest()
    $scope.$apply()

  it "has an element that is defined", ->
    # $apply runs the watch function, just making sure element exists
    expect(element).toBeDefined()
