describe "Blocket loading directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile('<blocket-loading></blocket-loading')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should wait at least 500ms before revealing itself", inject(($timeout) ->
    $timeout.flush()
    expect(isoScope.timeout).toBe(true)
    expect(isoScope.windowLoading).toBe(true)
  )

  describe "docIsReady", ->

    it "should return if wait time isnt long enough", ->
      isoScope.docIsReady()
      expect(isoScope.liftoff).toBe(undefined)
      expect(isoScope.hide).toBe(true)

    it "should engage liftoff if wait is too long", inject(($timeout) ->
      isoScope.timeout = true
      isoScope.docIsReady()
      $timeout.flush()
      expect(isoScope.liftoff).toBe(true)
      expect(isoScope.orbiting).toBe(true)
      expect(isoScope.windowLoading).toBe(false)
    )