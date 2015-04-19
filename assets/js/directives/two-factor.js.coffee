walletApp.directive('twoFactor', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/two-factor.jade'
    link: (scope, elem, attrs) ->
      scope.fields = {authenticatorCode: "", yubiKeyCode: ""}
      scope.settings = Wallet.settings
      scope.edit = {twoFactor: false, yubiKey: false} 
      scope.user = Wallet.user
      
      scope.disableSecondFactor = () ->
        return false unless scope.settings.needs2FA
    
        $translate("CONFIRM_DISABLE_2FA").then (translation) ->
          if confirm translation
            Wallet.disableSecondFactor()
          
      scope.setTwoFactorSMS = () ->
        if scope.user.isMobileVerified
          Wallet.setTwoFactorSMS()
          scope.edit.twoFactor = false
      
      scope.setTwoFactorEmail = () ->
        if scope.user.isEmailVerified
          Wallet.setTwoFactorEmail()
          scope.edit.twoFactor = false
          
      scope.setTwoFactorYubiKey = () ->
        if scope.fields.yubiKeyCode != ""
          Wallet.setTwoFactorYubiKey(scope.fields.yubiKeyCode)
          scope.edit.twoFactor = false
      
      scope.setTwoFactorGoogleAuthenticator = () ->
        scope.edit.yubiKey = false
        Wallet.setTwoFactorGoogleAuthenticator()
    
      scope.confirmTwoFactorGoogleAuthenticator = () ->
        Wallet.confirmTwoFactorGoogleAuthenticator(scope.fields.authenticatorCode)
        scope.edit.twoFactor = false
  }
)






