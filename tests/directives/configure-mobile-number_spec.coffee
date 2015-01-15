describe "Change Mobile Number Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  beforeEach module("walletApp")
  beforeEach(module('templates/configure-mobile-number.jade'))
  
  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->
    
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    Wallet.login("test", "test")
        
    return
  )
  
  beforeEach ->
    element = $compile("<configure-mobile-number></configure-mobile-number>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  
  it "should have text", ->
    expect(element.html()).toContain "MOBILE_NUMBER"
        
  it "should have the current phone number in its scope", ->
    expect(isoScope.user.mobile.number).toBe("12345678")

  it "should not spontaniously save", inject((Wallet) ->
    spyOn(Wallet, "changeMobile")
    expect(Wallet.changeMobile).not.toHaveBeenCalled()
    
    return
  )

  it "should let user change it", inject((Wallet) ->
    spyOn(Wallet, "changeMobile")

    isoScope.changeMobile("+3100000000")
        
    expect(Wallet.changeMobile).toHaveBeenCalled()
    
    return
  )
  
  it "should validate proposed number is not empty", ->
    expect(isoScope.validateMobileNumber(country: "+31", number:"")).toBe(false)
    return
    
  it "should validate proposed number contains only numbers", ->
    expect(isoScope.validateMobileNumber(country: "+31", number: "0800000000")).toBe(true)
    return
  
  it "should validate proposed number does not cotain letters", ->
    expect(isoScope.validateMobileNumber(country: "+31", number: "0800monkey")).toBe(false)
    return
  
  it "can be verified", inject((Wallet) ->
    spyOn(Wallet, "verifyMobile")

    isoScope.verifyMobile(country: "+31", number: "12345")
    
    expect(Wallet.verifyMobile).toHaveBeenCalled()
        
    return
  )
  
  return
  
    