walletApp.directive('configureMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/configure-mobile-number.jade'
    link: (scope, elem, attrs) ->      
      scope.user = Wallet.user
      scope.edit = {mobile: false}
      
      scope.mobileDefaultCountry = null
      
      scope.fields = {newMobile: null}
  
      scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
        scope.user.internationalMobileNumber = intlTelInputUtils.formatNumber(Wallet.internationalPhoneNumber(scope.user.mobile))
        
        scope.noMobile = scope.user.internationalMobileNumber == "+1"
        scope.fields.newMobile = scope.user.internationalMobileNumber
        
        if scope.noMobile
          # scope.mobileDefaultCountry = "nl"
          scope.fields.newMobile = null
            
      scope.changeMobile = (mobile) ->
        formattedNumber = intlTelInputUtils.formatNumber("+" + mobile)
        country = formattedNumber.split(" ")[0]
        number = formattedNumber.split(" ").slice(1).join("")
        mobile = {country: country, number: number}
        Wallet.changeMobile(mobile)
        scope.edit.mobile = false   
    
      scope.verifyMobile = (code) ->
        Wallet.verifyMobile(code)
  
      scope.validateMobileNumber = (candidate) ->
        # Duplicate effort:
        return intlTelInputUtils.isValidNumber("+" + candidate)
  }
)






