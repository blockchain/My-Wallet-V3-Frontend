angular.module('walletApp.core').factory('MyBlockchainSettings', () =>
  ({
    unsetTwoFactor (success, error) { return success(); },
    setTwoFactorSMS (success, error) { return success(); },
    setTwoFactorEmail (success, error) { return success(); },
    setTwoFactorYubiKey (code, success, error) { return success(); },
    setTwoFactorGoogleAuthenticator (success, error) { return success('secret_sauce'); },
    confirmTwoFactorGoogleAuthenticator (code, success, error) {
      if (code === 'secret_sauce') { return success(); } else { return error(); }
    },
    enableRememberTwoFactor (success, error) { return success(); },
    disableRememberTwoFactor (success, error) { return success(); },
    toggleSave2FA (flag, success, error) { return success(); },
    sendConfirmationCode (success, error) { return success(); }
  })
);
