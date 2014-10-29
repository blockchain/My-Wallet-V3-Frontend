@SettingsMyDetailsCtrl = ($scope, Wallet) ->
  $scope.edit = {email: false, mobile: false, password: false, passwordHint: false} 
  $scope.user = Wallet.user
  
  $scope.changeEmail = (email) ->
    Wallet.changeEmail(email)
    $scope.edit.email = false
  
  $scope.changeMobile = (mobile) ->
    Wallet.changeMobile(mobile)
    $scope.edit.mobile = false   
  
  $scope.validateMobileNumber = (candidate) ->
    return false unless candidate?
    return false if candidate.length < 4
    return false if candidate[0] != "+"
    return false if isNaN(parseInt(candidate.slice(1)))
    return false if parseInt(candidate.slice(1)).toString() != candidate.slice(1)
    return true