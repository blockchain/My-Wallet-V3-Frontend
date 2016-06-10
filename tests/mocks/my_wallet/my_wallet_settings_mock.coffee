angular.module('walletApp.core').factory 'MyBlockchainSettings', () ->
  {
    getAccountInfo: (success, error) ->
      success({
        email: "steve@me.com"
        email_verified: 1
        sms_number: "+31 12345678"
        sms_verified: 0
        password_hint1: "Same as username"
        language: "en"
        currency: "USD"
        btc_currency: "BTC"
        block_tor_ips: 0
        my_ip: "123.456.789.012"
      })
    unsetTwoFactor: (success, error) -> success()
    setTwoFactorSMS: (success, error) -> success()
    setTwoFactorEmail: (success, error) -> success()
    setTwoFactorYubiKey: (code, success, error) -> success()
    setTwoFactorGoogleAuthenticator: (success, error) -> success('secret_sauce')
    confirmTwoFactorGoogleAuthenticator: (code, success, error) ->
      if code == 'secret_sauce' then success() else error()
    enableRememberTwoFactor: (success, error) -> success()
    disableRememberTwoFactor: (success, error) -> success()
    toggleSave2FA: (flag, success, error) -> success()
  }
