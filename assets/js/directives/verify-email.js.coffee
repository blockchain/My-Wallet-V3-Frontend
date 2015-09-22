angular.module('walletApp').directive('verifyEmail', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      _buttonClass: '@buttonClass'
    }
    templateUrl: 'templates/verify-email.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      scope.user = Wallet.user

      scope.errors =
        emailVerificationCode: null

      scope.status =
        busy: false

      scope.buttonClass = scope._buttonClass || 'button-primary'

      scope.verifyEmail = (code) ->

        scope.status.busy = true

        error = () ->
          scope.status.busy = false
          $translate("EMAIL_VERIFICATION_FAILED").then (translation) ->
            scope.errors.emailVerificationCode = translation

        success = () ->
          scope.status.busy = false
          scope.code = ''

        Wallet.verifyEmail(code, success, error)

  }
)
