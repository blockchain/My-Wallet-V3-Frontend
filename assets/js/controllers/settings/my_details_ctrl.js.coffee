@SettingsMyDetailsCtrl = ($scope, Wallet, $modal, $filter, $translate) ->  
  $scope.fields = {authenticatorCode: ""}
  
  $scope.edit = {email: false, password: false, passwordHint: false, twoFactor: false} 
  $scope.user = Wallet.user
  $scope.settings = Wallet.settings

  $scope.$watch "user.passwordHint", (newValue) ->
    $scope.newPasswordHint = newValue
  
  $scope.changeEmail = (email) ->
    Wallet.changeEmail(email)
    $scope.edit.email = false
    
  $scope.changePassword = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/change-password.jade"
      controller: ChangePasswordCtrl
      windowClass: "blockchain-modal"
    )
  
  $scope.changePasswordHint = (hint) ->
    Wallet.changePasswordHint(hint)
    $scope.edit.passwordHint = false   
      
  $scope.disableSecondFactor = () ->
    return false unless $scope.settings.needs2FA
    
    $translate("CONFIRM_DISABLE_2FA").then (translation) ->
      if confirm translation
        Wallet.disableSecondFactor()
          
  $scope.setTwoFactorSMS = () ->
    if $scope.user.isMobileVerified
      Wallet.setTwoFactorSMS()
      $scope.edit.twoFactor = false
      
  $scope.setTwoFactorEmail = () ->
    if $scope.user.isEmailVerified
      Wallet.setTwoFactorEmail()
      $scope.edit.twoFactor = false
      
  $scope.setTwoFactorGoogleAuthenticator = () ->
    Wallet.setTwoFactorGoogleAuthenticator()
    
  $scope.confirmTwoFactorGoogleAuthenticator = () ->
    Wallet.confirmTwoFactorGoogleAuthenticator($scope.fields.authenticatorCode)
    $scope.edit.twoFactor = false