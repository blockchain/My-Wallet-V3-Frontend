@SettingsAdvancedCtrl = ($scope, Wallet, $modal) ->
  $scope.settings = Wallet.settings
  
  $scope.edit = {pbkdf2: false, pbkdf2_second_password: false} 
  
  $scope.validatePbkdf2 = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate) || candidate < 1
    return true
    
  $scope.changePbkdf2 = (n) ->
    Wallet.setPbkdf2Iterations(n, (()->), (()->))
    $scope.edit.pbkdf2 = false
    
  # $scope.changeSecondPasswordPbkdf2 = (n) ->
  #   Wallet.setSecondPasswordPbkdf2Iterations(n, (()->), (()->))
  #   $scope.edit.pbkdf2_second_password = false