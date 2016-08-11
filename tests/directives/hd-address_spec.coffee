fdescribe "Hd Address Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  MyWallet = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    
    return
  )

  beforeEach ->
    element = $compile("<div hd-address></div>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    isoScope.address = {}

    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

  it "has an element that is defined", ->
    expect(element).toBeDefined()

  it "can stop editing", ->
    isoScope.editing = true
    isoScope.cancelEdit()
    
    expect(isoScope.editing).toBe(false)
    
  describe "changeLabel", ->
    
    it "should call a function to change the address label", ->
      isoScope.account = { index: 1 }
      isoScope.address = { index: 1 }
      spyOn(Wallet, "changeHDAddressLabel")
      isoScope.changeLabel()
      expect(Wallet.changeHDAddressLabel).toHaveBeenCalled()
      
      return
