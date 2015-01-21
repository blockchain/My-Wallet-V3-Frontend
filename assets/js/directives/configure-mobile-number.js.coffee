walletApp.directive('configureMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/configure-mobile-number.jade'
    link: (scope, elem, attrs) ->
      scope.countries = require('country-data').countries.all
      
      scope.user = Wallet.user
      scope.edit = {mobile: false}
            
      scope.newMobile = {country: null, number: null}
  
      scope.$watch "user.mobile", (newValue) -> # Update form
        if scope.user.mobile?
          scope.newMobile.country = null
          if newValue.country? && newValue.country != ""
            scope.newMobile.country = $filter("getByPropertyNested")("countryCallingCodes", newValue.country, scope.countries)
          scope.newMobile.number = newValue.number
    
      scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
        scope.user.internationalMobileNumber = Wallet.internationalPhoneNumber(scope.user.mobile)
        scope.noMobile = scope.user.internationalMobileNumber == "+1 "
  
      scope.changeMobile = (mobile) ->
        country = if (mobile.country? && mobile.country != "") then mobile.country.countryCallingCodes[0] else ""
        mobile = {country: country, number: mobile.number}
        Wallet.changeMobile(mobile)
        scope.edit.mobile = false   
    
      scope.verifyMobile = (code) ->
        Wallet.verifyMobile(code)
  
      scope.validateMobileNumber = (candidate) ->
        return false unless candidate.number?
        return false if candidate.number.length < 4
        return false if isNaN(parseInt(candidate.number))
        return false if parseInt(candidate.number, 10).toString() != candidate.number.replace(/^0*/, '')
        return true
  }
)






