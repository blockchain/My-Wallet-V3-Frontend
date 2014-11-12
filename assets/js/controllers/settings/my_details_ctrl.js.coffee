@SettingsMyDetailsCtrl = ($scope, Wallet, $modal) ->
  $scope.edit = {email: false, mobile: false, password: false, passwordHint: false} 
  $scope.user = Wallet.user
  $scope.countries = require('country-data').countries
  
  $scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
    $scope.user.internationalMobileNumber = Wallet.internationalPhoneNumber($scope.user.mobile)
  
  $scope.$watch "user.passwordHint", (newValue) ->
    $scope.newPasswordHint = newValue
  
  $scope.changeEmail = (email) ->
    Wallet.changeEmail(email)
    $scope.edit.email = false
  
  $scope.changeMobile = (number) ->
    mobile = {country: $scope.user.mobile.country, number: number} # Pending a country dropdown
    Wallet.changeMobile(mobile)
    $scope.edit.mobile = false   
    
  $scope.verifyMobile = (code) ->
    Wallet.verifyMobile(code)
  
  $scope.validateMobileNumber = (candidate) ->
    return false unless candidate?
    return false if candidate.length < 4
    return false if candidate[0] != "0"
    return false if isNaN(parseInt(candidate))
    return false if parseInt(candidate, 10).toString() != candidate.replace(/^0+/, '')
    return true
    
  $scope.changePassword = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/change-password"
      controller: ChangePasswordCtrl
    )
  
  $scope.changePasswordHint = (hint) ->
    Wallet.changePasswordHint(hint)
    $scope.edit.passwordHint = false   