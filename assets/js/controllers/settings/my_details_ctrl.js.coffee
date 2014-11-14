@SettingsMyDetailsCtrl = ($scope, Wallet, $modal, $filter) ->
  $scope.countries = require('country-data').countries.all
  
  $scope.edit = {email: false, mobile: false, password: false, passwordHint: false} 
  $scope.user = Wallet.user
  
  $scope.newMobile = {country: null, number: null}
  
  $scope.$watch "user.mobile", (newValue) -> # Update form
    $scope.newMobile.country = null
    if newValue.country? && newValue.country != ""
      $scope.newMobile.country = $filter("getByPropertyNested")("countryCallingCodes", newValue.country, $scope.countries)
    $scope.newMobile.number = newValue.number
    
  
  $scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
    $scope.user.internationalMobileNumber = Wallet.internationalPhoneNumber($scope.user.mobile)
  
  $scope.$watch "user.passwordHint", (newValue) ->
    $scope.newPasswordHint = newValue
  
  $scope.changeEmail = (email) ->
    Wallet.changeEmail(email)
    $scope.edit.email = false
  
  $scope.changeMobile = (mobile) ->
    country = if (mobile.country? && mobile.country != "") then mobile.country.countryCallingCodes[0] else ""
    mobile = {country: country, number: mobile.number}
    Wallet.changeMobile(mobile)
    $scope.edit.mobile = false   
    
  $scope.verifyMobile = (code) ->
    Wallet.verifyMobile(code)
  
  $scope.validateMobileNumber = (candidate) ->
    return false unless candidate.number?
    return false if candidate.number.length < 4
    return false if candidate.number[0] != "0"
    return false if isNaN(parseInt(candidate.number))
    return false if parseInt(candidate.number, 10).toString() != candidate.number.replace(/^0+/, '')
    return true
    
  $scope.changePassword = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/change-password"
      controller: ChangePasswordCtrl
    )
  
  $scope.changePasswordHint = (hint) ->
    Wallet.changePasswordHint(hint)
    $scope.edit.passwordHint = false   