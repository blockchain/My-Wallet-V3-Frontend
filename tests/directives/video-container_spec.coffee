describe "Scroll in View Directive", ->
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
    element = $compile("<video-container img='img/blockchain-ad-placeholder.jpg' video='img/blockchain-ad.mp4'></video-container>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have an image", ->
    expect(isoScope.img).toBeDefined()

  it "should have a video", ->
    expect(isoScope.video).toBeDefined()

  it "should toggle play and pause", ->
    isoScope.playing = false
    isoScope.toggle()
    expect(isoScope.playing).toBe(true)

