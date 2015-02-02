describe "2FA Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  beforeEach module("walletApp")
  beforeEach(module('templates/two-factor.jade'))
  
  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->
    
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    Wallet.login("test", "test")
        
    return
  )
  
  beforeEach ->
    element = $compile("<two-factor></two-factor>")($rootScope)
    $rootScope.$digest()
    
    isoScope = element.isolateScope()
    isoScope.$digest()
  
  it "should have text", ->
    expect(element.html()).toContain "2FA_EMAIL"
    
  it "can be disabled", inject((Wallet) ->
    Wallet.login("test-2FA", "test", "123456")
    isoScope.$digest()
    expect(Wallet.status.isLoggedIn).toBe(true)
    
    spyOn(window, 'confirm').and.callFake(() ->
         return true
    )
      
    spyOn(Wallet, "disableSecondFactor") #.and.callThrough()
    isoScope.disableSecondFactor()
    expect(Wallet.disableSecondFactor).toHaveBeenCalled()
  )
  
  it "can't be disabled if not enabled", inject((Wallet) ->
    Wallet.login("test", "test")
    isoScope.$digest()
    expect(Wallet.status.isLoggedIn).toBe(true)
    
    spyOn(Wallet, "disableSecondFactor")
    isoScope.disableSecondFactor()
    expect(Wallet.disableSecondFactor).not.toHaveBeenCalled()
  )
  
  describe "configure", ->
    beforeEach ->
      isoScope.user.isEmailVerified = true
      isoScope.user.isMobileVerified = true
      isoScope.settings.needs2FA = null
  
    it "with sms", inject((Wallet) ->
      spyOn(Wallet, "setTwoFactorSMS").and.callThrough()
      isoScope.setTwoFactorSMS()
      expect(Wallet.setTwoFactorSMS).toHaveBeenCalled()
      expect(isoScope.settings.needs2FA).toBe(true)
      
    )
    
    it "sms can't be enabled if mobile is not verified", inject((Wallet) ->
      isoScope.user.isMobileVerified = false
      spyOn(Wallet, "setTwoFactorSMS")
      isoScope.setTwoFactorSMS()
      expect(Wallet.setTwoFactorSMS).not.toHaveBeenCalled()
    )
    
    it "with email", inject((Wallet) ->
      spyOn(Wallet, "setTwoFactorEmail").and.callThrough()
      isoScope.setTwoFactorEmail()
      expect(Wallet.setTwoFactorEmail).toHaveBeenCalled()
      expect(isoScope.settings.needs2FA).toBe(true)
    )
    
    it "email can't be enabled if email is not verified", inject((Wallet) ->
      isoScope.user.isEmailVerified = false
      spyOn(Wallet, "setTwoFactorEmail")
      isoScope.setTwoFactorEmail()
      expect(Wallet.setTwoFactorEmail).not.toHaveBeenCalled()
    )
    
    it "configure Google Authenticator returns secret url", inject((Wallet) ->
      spyOn(Wallet, "setTwoFactorGoogleAuthenticator").and.callThrough()
      isoScope.setTwoFactorGoogleAuthenticator()
      expect(Wallet.setTwoFactorGoogleAuthenticator).toHaveBeenCalled()
      expect(isoScope.settings.googleAuthenticatorSecret).toBe("google_secret")        
    )
    
    it "configure Google Auth does not immediately enable", inject((Wallet) ->
      expect(isoScope.settings.needs2FA).toBeNull()
      isoScope.setTwoFactorGoogleAuthenticator()
      expect(isoScope.settings.needs2FA).toBeNull()
    )
    
    it "enable Google Authenticator with confirmation code", inject((Wallet) ->
      isoScope.fields.authenticatorCode = "123456"
      spyOn(Wallet, "confirmTwoFactorGoogleAuthenticator").and.callThrough()
      isoScope.confirmTwoFactorGoogleAuthenticator()
      expect(Wallet.confirmTwoFactorGoogleAuthenticator).toHaveBeenCalledWith("123456")
      expect(isoScope.settings.needs2FA).toBe(true)
    )
    
    return