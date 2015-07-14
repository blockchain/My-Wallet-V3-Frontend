angular.module("myBlockchainSettingsServices", []).factory "MyBlockchainSettings", () ->
    email = "steve@me.com"
    mobile = "+31 12345678"
    language = "en"
    
    {   
      update_password_hint1: (hint, success, error) ->
        if hint.split('').some((c) -> c.charCodeAt(0) > 255)
          error(101)
        else
          success()
        
      verifyMobile: (code, success, error) ->		
        success()
        
      changeMobileNumber: (newVal, success, error) ->		
        mobile = newVal		
        success()
        
      change_email: (newVal, success, error) ->		
        email = newVal		
        success()
        
      change_local_currency: (newCurrency) ->		
        
      change_language: (language, success, error) ->
        success()
        
      setTwoFactorGoogleAuthenticator: (success, error) ->		
        success("google_secret")
      
      confirmTwoFactorGoogleAuthenticator: (code, success, error) ->		
        if code == "123456"		
          success()		
        else		
          error()
      
      setTwoFactorYubiKey: (code, success, error) ->
        if code == "123456"
          success()
        else
          error()

      setTwoFactorEmail: (success, error) ->
        success()
      
      setTwoFactorSMS: (success, error) ->
        success()
        
      unsetTwoFactor: (success, error) ->
        success()
      
      update_tor_ip_block: (onOff, success, error) ->
        success()
    }