@SettingsMyDetailsCtrl = ($scope, Wallet, $modal, $filter, $translate) ->    
  $scope.edit = {email: false, password: false, passwordHint: false} 
  $scope.user = Wallet.user
  $scope.settings = Wallet.settings

  $scope.changeMultiAccountSetting = () ->
    Wallet.setMultiAccount(!Wallet.settings.multiAccount)
  
  $scope.changeEmail = (email, success, error) ->
    Wallet.changeEmail(email, success, error)
    
  $scope.changePasswordHint = (hint, success, error) ->
    Wallet.changePasswordHint(hint, success, error)
    
  $scope.changePassword = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/change-password.jade"
      controller: ChangePasswordCtrl
      windowClass: "blockchain-modal"
    )