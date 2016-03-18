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
    element = $compile("<scroll-in-view img='img/new-wallet-hero.jpg'></scroll-in-view>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have an image", ->
    expect(isoScope.img).toBeDefined()

  it "should not have a shadow unless defined", ->
    expect(isoScope.shadow).toBeFalsy()

  it "should not have transactions unless defined", ->
    expect(isoScope.transactions).toBeFalsy()

  it "should call onScroll", inject(($timeout) ->
    spyOn(isoScope, "onScroll")
    isoScope.initScroll()
    $timeout.flush()

    expect(isoScope.onScroll).toHaveBeenCalled()
  )

  it "should not be active if the element is not visible", ->
    bottom = 1500
    top = 1600
    isoScope.onScroll(bottom, top)

    expect(isoScope.isActive).toBeFalsy()
  

  it "should be active when the element is visible", ->
    bottom = 1500
    top = 1000
    isoScope.onScroll(bottom, top)

    expect(isoScope.isActive).toBeTruthy()
    

  return
