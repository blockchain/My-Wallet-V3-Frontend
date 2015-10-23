angular.module('walletApp').directive('configureMobileNumber', ($translate, Wallet, $filter, $timeout) ->
  {
    restrict: "E"
    replace: true
    scope: {
      onCancel: '&'
      onSuccess: '&'
    }
    templateUrl: 'templates/configure-mobile-number.jade'
    link: (scope, elem, attrs) ->
      scope.mobileDefaultCountry = null

      scope.status = {busy: false}
      scope.fields = {newMobile: null}

      if attrs.buttonLg?
        scope.buttonLg = true

      if attrs.fullWidth?
        scope.fullWidth = true

      scope.fields.newMobile = Wallet.user.internationalMobileNumber

      scope.numberChanged = () ->
        scope.fields.newMobile != Wallet.user.internationalMobileNumber

      scope.cancel = () ->
        # This doesn't update the form
        scope.fields.newMobile = Wallet.user.internationalMobileNumber

        scope.onCancel()

      scope.changeMobile = () ->
        scope.status.busy = true

        success = () ->
          scope.status.busy = false
          scope.onSuccess()
          Wallet.user.internationalMobileNumber = scope.fields.newMobile
          Wallet.saveActivity(2)

        error = (error) ->
          scope.status.busy = false

        country = scope.fields.newMobile.split(" ")[0]
        number = scope.fields.newMobile.split(" ").slice(1).join("")
        mobile = {country: country, number: number}
        Wallet.changeMobile(mobile, success, error)
  }
)
