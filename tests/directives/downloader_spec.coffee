describe "downloader", ->
  element = undefined
  scope = undefined
  $rootScope = undefined
  $window = undefined
  $timeout = undefined

  beforeEach module("walletApp")

  beforeEach inject(($compile, _$rootScope_, _$window_, _$timeout_) ->
    $rootScope = _$rootScope_
    $window = _$window_
    $timeout = _$timeout_

    scope = $rootScope.$new()
    element = $compile("<downloader></downloader>")(scope)
  )

  beforeEach ->
    spyOn($window, 'Blob').and.callFake((data) -> toString: -> "blob[#{data.join()}]")
    spyOn($window.URL, 'createObjectURL').and.callFake((obj) -> "ref://#{obj}")
    $rootScope.$broadcast('download', { contents: 'asdf', filename: 'test.txt' })

  it "should create a data ref on receiving download event", ->
    expect(scope.dataRef).toEqual('ref://blob[asdf]')

  it "should use the correct filename", ->
    expect(scope.filename).toEqual('test.txt')

  it "should click the anchor tag to trigger download", ->
    spyOn(element[0], 'click')
    $timeout.flush()
    expect(element[0].click).toHaveBeenCalled()
