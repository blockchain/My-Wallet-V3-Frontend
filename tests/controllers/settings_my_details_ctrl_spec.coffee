describe "SettingsMyDetailsCtrl", ->
  scope = undefined
  Wallet = undefined
  
  modal =
    open: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsMyDetailsCtrl",
        $scope: scope,
        $stateParams: {},
        $modal: modal
        
      scope.$digest()
      
      return

    return
    
  describe "email", ->   
    it "should be set on load", inject((Wallet) ->
      expect(scope.user.email).toEqual("steve@me.com")
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "changeEmail")
      expect(Wallet.changeEmail).not.toHaveBeenCalled()
      
      return
    )
  
    it "should let user change their email", inject((Wallet) ->
      spyOn(Wallet, "changeEmail").and.callThrough()

      scope.changeEmail("other@me.com")
      
      scope.$digest()
    
      expect(Wallet.changeEmail).toHaveBeenCalledWith("other@me.com")
      expect(scope.user.email).toBe("other@me.com")
      
      return
    )
    
    return
    
  describe "mobile", ->   
    it "should be set on load", inject((Wallet) ->
      expect(scope.user.mobile.number).toEqual("012345678")
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "changeMobile")
      expect(Wallet.changeMobile).not.toHaveBeenCalled()
      
      return
    )
  
    it "should let user change it", inject((Wallet) ->
      spyOn(Wallet, "changeMobile")

      scope.changeMobile("+3100000000")
          
      expect(Wallet.changeMobile).toHaveBeenCalled()
      
      return
    )
    
    it "should validate proposed number is not empty", ->
      expect(scope.validateMobileNumber(country: "+31", number:"")).toBe(false)
      return
      
    it "should validate proposed number contains only numbers", ->
      expect(scope.validateMobileNumber(country: "+31", number: "0800000000")).toBe(true)
      return
    
    it "should validate proposed number does not cotain letters", ->
      expect(scope.validateMobileNumber(country: "+31", number: "0800monkey")).toBe(false)
      return
    
    it "can be verified", inject((Wallet) ->
      spyOn(Wallet, "verifyMobile")

      scope.verifyMobile(country: "+31", number: "12345")
      
      expect(Wallet.verifyMobile).toHaveBeenCalled()
          
      return
    )
    
  describe "password", ->   
    it "can be changed through modal", inject(($modal) ->
      spyOn(modal, "open")
      scope.changePassword()
      expect(modal.open).toHaveBeenCalled()
    )

    return
  
  describe "password hint", ->   
  
    it "should let user change it", inject((Wallet) ->
      spyOn(Wallet, "changePasswordHint")
      scope.edit.passwordHint = false

      scope.changePasswordHint("Other hint")

          
      expect(Wallet.changePasswordHint).toHaveBeenCalledWith("Other hint")
      
      return
    )
    
  describe "2FA", ->
    it "can be disabled", inject((Wallet) ->
      Wallet.login("test-2FA", "test", "123456")
      scope.$digest()
      expect(Wallet.status.isLoggedIn).toBe(true)
      
      spyOn(window, 'confirm').and.callFake(() ->
           return true
      )
        
      spyOn(Wallet, "disableSecondFactor") #.and.callThrough()
      scope.disableSecondFactor()
      expect(Wallet.disableSecondFactor).toHaveBeenCalled()
    )
    
    it "can't be disabled if not enabled", inject((Wallet) ->
      Wallet.login("test", "test")
      scope.$digest()
      expect(Wallet.status.isLoggedIn).toBe(true)
      
      spyOn(Wallet, "disableSecondFactor")
      scope.disableSecondFactor()
      expect(Wallet.disableSecondFactor).not.toHaveBeenCalled()
    )
    
    describe "configure", ->
      beforeEach ->
        Wallet.login("test", "test")
        scope.$digest()
        scope.user.isEmailVerified = true
        scope.user.isMobileVerified = true
    
      it "with sms", inject((Wallet) ->
        spyOn(Wallet, "setTwoFactorSMS").and.callThrough()
        scope.setTwoFactorSMS()
        expect(Wallet.setTwoFactorSMS).toHaveBeenCalled()
        expect(scope.settings.needs2FA).toBe(true)
        
      )
      
      it "sms can't be enabled if mobile is not verified", inject((Wallet) ->
        scope.user.isMobileVerified = false
        spyOn(Wallet, "setTwoFactorSMS")
        scope.setTwoFactorSMS()
        expect(Wallet.setTwoFactorSMS).not.toHaveBeenCalled()
      )
      
      it "with email", inject((Wallet) ->
        spyOn(Wallet, "setTwoFactorEmail").and.callThrough()
        scope.setTwoFactorEmail()
        expect(Wallet.setTwoFactorEmail).toHaveBeenCalled()
        expect(scope.settings.needs2FA).toBe(true)
      )
      
      it "email can't be enabled if email is not verified", inject((Wallet) ->
        scope.user.isEmailVerified = false
        spyOn(Wallet, "setTwoFactorEmail")
        scope.setTwoFactorEmail()
        expect(Wallet.setTwoFactorEmail).not.toHaveBeenCalled()
      )
      
      it "configure Google Authenticator returns secret url", inject((Wallet) ->
        spyOn(Wallet, "setTwoFactorGoogleAuthenticator").and.callThrough()
        scope.setTwoFactorGoogleAuthenticator()
        expect(Wallet.setTwoFactorGoogleAuthenticator).toHaveBeenCalled()
        expect(scope.settings.googleAuthenticatorSecret).toBe("google_secret")        
      )
      
      it "configure Google Auth does not immediately enable", inject((Wallet) ->
        scope.setTwoFactorGoogleAuthenticator()
        expect(scope.settings.needs2FA).toBeNull()
      )
      
      it "enable Google Authenticator with confirmation code", inject((Wallet) ->
        scope.fields.authenticatorCode = "123456"
        spyOn(Wallet, "confirmTwoFactorGoogleAuthenticator").and.callThrough()
        scope.confirmTwoFactorGoogleAuthenticator()
        expect(Wallet.confirmTwoFactorGoogleAuthenticator).toHaveBeenCalledWith("123456")
        expect(scope.settings.needs2FA).toBe(true)
      )
      
      return
    
    return