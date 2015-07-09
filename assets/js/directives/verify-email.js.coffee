walletApp.directive('verifyEmail', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      buttonClass: '@'
    }
    templateUrl: 'templates/verify-email.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      scope.user = Wallet.user
      scope.errors =
          emailVerificationCode: null

      unless scope.buttonClass?
        scope.buttonClass = 'button-primary'

      scope.verifyEmail = (code) ->
        error = () ->
          $translate("EMAIL_VERIFICATION_FAILED").then (translation) ->
            scope.errors.emailVerificationCode = translation

        success = () ->

        Wallet.verifyEmail(code, success, error)

  }
)
