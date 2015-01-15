@SettingsMyDetailsCtrl = ($scope, Wallet, $modal, $filter, $translate) ->    
  $scope.edit = {email: false, password: false, passwordHint: false} 
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