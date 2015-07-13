describe "Change Mobile Number Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  beforeEach module("walletApp")
  beforeEach module("templates/configure-mobile-number.jade")
  
  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->
    
    $compile = _$compile_
    $rootScope = _$rootScope_
            
    return
  )
  
  beforeEach ->
    element = $compile("<configure-mobile-number></configure-mobile-number>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  
  it "should have text", ->
    expect(element.html()).toContain "SAVE"
        
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
  
  it "should validate proposed number", ->
    isoScope.fields.newMobile = "31"
    expect(isoScope.validateMobileNumber()).toBe(false)
    return
  
  return
  
    