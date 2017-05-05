describe "Scroll To Top Directive", ->
  $compile = undefined
  $rootScope = undefined
  $scope = undefined
  element = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()

    return
  )

  beforeEach ->
    element = $compile("<div scroll-to-top></div>")($rootScope)
    $rootScope.$digest()
    $scope.$apply()

  it "has an element that is defined", ->
    # $apply runs the watch function, just making sure element exists
    expect(element).toBeDefined()
