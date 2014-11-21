describe "Network Fee Picker Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  # Load the myApp module, which contains the directive
  beforeEach module("walletApp")
  beforeEach(module('templates/network-fee-picker.html'))
  
  # Store references to $rootScope and $compile
  # so they are available to all tests in this describe block
  beforeEach inject((_$compile_, _$rootScope_) ->
    
    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_
        
    return
  )
  
  beforeEach ->
    element = $compile("<network-fee-picker></network-fee-picker>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
  
  it "should show policy names", ->
    expect(element.html()).toContain "FRUGAL"
        
  it "should have the current policy in its scope", ->
    expect(isoScope.selectedPolicy.value).toBe(0)
    
  it "should save a policy change", inject((Wallet) ->
    spyOn(Wallet, "setFeePolicy")
    isoScope.didSelect(isoScope.policies[2])
    isoScope.$digest()
    expect(Wallet.setFeePolicy).toHaveBeenCalled()
  )
  
  it "should not save an unmodified policy", inject((Wallet) ->
    spyOn(Wallet, "setFeePolicy")
    isoScope.$digest()
    expect(Wallet.setFeePolicy).not.toHaveBeenCalled()
  )

  return
  
    