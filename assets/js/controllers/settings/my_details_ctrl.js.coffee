@SettingsMyDetailsCtrl = ($scope, Wallet) ->
  $scope.edit = {email: false, mobile: false, password: false, passwordHint: false} 
  $scope.user = Wallet.user
  
  $scope.changeEmail = (email) ->
    Wallet.changeEmail(email)
    $scope.edit.email = false
       
    