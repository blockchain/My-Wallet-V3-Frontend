walletApp.directive('configureMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: true
    scope: {
      step: "="
    }
    templateUrl: 'templates/configure-mobile-number.jade'
    link: (scope, elem, attrs) ->
      scope.user = Wallet.user
      scope.mobileDefaultCountry = null

      scope.status = {busy: false}
      scope.fields = {newMobile: null}
      
      if attrs.buttonLg?
        scope.buttonLg = true

      if attrs.fullWidth?
        scope.fullWidth = true
      
      scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
        scope.user.internationalMobileNumber = intlTelInputUtils.formatNumber(Wallet.internationalPhoneNumber(scope.user.mobile))
        
        scope.noMobile = scope.user.internationalMobileNumber == "+1"
        scope.fields.newMobile = scope.user.internationalMobileNumber
                
        if scope.noMobile
          scope.mobileDefaultCountry = Wallet.status.currentCountryCode
          scope.fields.newMobile = "+" + Wallet.status.currentCountryDialCode

      scope.cancel = () ->
        scope.step = 0
            
      scope.changeMobile = (mobile) ->
        scope.status.busy = true
        
        success = () ->
          scope.status.busy = false
          scope.step = 2
          
        error = (error) ->
          scope.status.busy = false
        
        formattedNumber = intlTelInputUtils.formatNumber("+" + mobile)
        country = formattedNumber.split(" ")[0]
        number = formattedNumber.split(" ").slice(1).join("")
        mobile = {country: country, number: number}
        Wallet.changeMobile(mobile, success, error)
  
      scope.validateMobileNumber = (candidate) ->
        return intlTelInputUtils.isValidNumber("+" + candidate)

  }
)
