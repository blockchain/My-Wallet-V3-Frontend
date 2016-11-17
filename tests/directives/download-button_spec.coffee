describe "downloadButton", ->
  scope = undefined
  element = undefined
  isoScope = undefined
  $timeout = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, $window, _$timeout_) ->
    $timeout = _$timeout_

    spyOn($window, 'Blob').and.callFake((data) -> toString: -> "data[#{data.join()}]")
    spyOn($window.URL, 'createObjectURL').and.callFake((obj) -> "blob://#{obj}")

    scope = $rootScope.$new()
    scope.content = 'asdf'
    scope.$digest()

    element = $compile("<download-button content='content' filename='test.txt'></download-button>")(scope)
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  it "should create a data ref for content", ->
    expect(isoScope.dataRef).toEqual('blob://data[asdf]')

  it "should create a data ref when content is updated", ->
    isoScope.content = 'abc'
    isoScope.$digest()
    expect(isoScope.dataRef).toEqual('blob://data[abc]')

  it "should use the correct filename", ->
    expect(isoScope.filename).toEqual('test.txt')

  it "should click the anchor tag to trigger download", ->
    spyOn(element[0], 'click')
    scope.$broadcast("download")
    $timeout.flush()
    expect(element[0].click).toHaveBeenCalled()
