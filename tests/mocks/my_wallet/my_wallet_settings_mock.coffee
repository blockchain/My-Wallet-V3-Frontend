angular.module("myBlockchainSettingsServices", []).factory "MyBlockchainSettings", () ->
    email = "steve@me.com"
    mobile = "+31 12345678"
    language = "en"
    
    {
      get_account_info: (success, error) ->
        success({
          email: email
          email_verified: 1
          sms_number: mobile
          sms_verified: 0
          password_hint1: "Same as username"
          language: language
          currency: "USD"
          btc_currency: "BTC"
          block_tor_ips: 0
          my_ip: "123.456.789.012"
        })
        
      update_password_hint1: (hint, success) ->
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
          
      setTwoFactorEmail: (success, error) ->
        success()
      
      setTwoFactorSMS: (success, error) ->
        success()
        
      unsetTwoFactor: (success, error) ->
        success()
      
      update_tor_ip_block: (onOff, success, error) ->
        success()
    }