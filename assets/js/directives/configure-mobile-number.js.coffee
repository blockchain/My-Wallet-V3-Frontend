walletApp.directive('configureMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: true
    scope: {
      onCancel: '&'
      onSuccess: '&'
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

      scope.watchMobileNumberOnce = scope.$watch "user.mobile.number + user.mobile.country", (newValue) ->
        return unless scope.user.mobile?

        scope.user.internationalMobileNumber = intlTelInputUtils.formatNumber(Wallet.internationalPhoneNumber(scope.user.mobile))

        scope.noMobile = scope.user.internationalMobileNumber == "+1"
        scope.fields.newMobile = scope.user.internationalMobileNumber

        if scope.noMobile
          scope.mobileDefaultCountry = Wallet.status.currentCountryCode
          scope.fields.newMobile = "+" + Wallet.status.currentCountryDialCode

        # Without killing this watcher, the input field will have a function in
        # it after you save a new number once.
        scope.watchMobileNumberOnce()

      scope.cancel = () ->
        scope.onCancel()

      scope.changeMobile = () ->
        scope.status.busy = true

        formattedNumber = intlTelInputUtils.formatNumber("+" + scope.fields.newMobile)

        success = () ->
          scope.status.busy = false
          scope.onSuccess()
          scope.user.internationalMobileNumber = formattedNumber
          Wallet.saveActivity(2)

        error = (error) ->
          scope.status.busy = false

        country = formattedNumber.split(" ")[0]
        number = formattedNumber.split(" ").slice(1).join("")
        mobile = {country: country, number: number}
        Wallet.changeMobile(mobile, success, error)

      scope.validateMobileNumber = () ->
        return intlTelInputUtils.isValidNumber("+" + scope.fields.newMobile)

  }
)
