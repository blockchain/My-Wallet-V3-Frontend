angular.module('walletApp.core').factory 'MyBlockchainSettings', ($q) ->
  {
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
    sendConfirmationCode: (success, error) -> success()
    changeBtcCurrency: (currency) -> $q.resolve()
  }
