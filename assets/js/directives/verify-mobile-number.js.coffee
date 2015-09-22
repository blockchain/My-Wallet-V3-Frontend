angular.module('walletApp').directive('verifyMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: true
    scope: {
      onSuccess: '&'
    }
    templateUrl: 'templates/verify-mobile-number.jade'
    link: (scope, elem, attrs) ->
      scope.status = {busy: false, retrying: false, retrySuccess: false}
      scope.errors = {verify: null, retryFail: null}

      if attrs.buttonLg?
        scope.buttonLg = true

      if attrs.fullWidth?
        scope.fullWidth = true

      scope.retrySendCode = () ->
        scope.status.retrying = true

        success = () ->
          scope.status.retrying = false
          scope.status.retrySuccess = true
          scope.errors.retryFail = null

        error = () ->
          scope.status.retrying = false
          scope.status.retrySuccess = false
          scope.errors.retryFail = 'Error resending verification code'

        Wallet.changeMobile(Wallet.user.mobile, success, error)

      scope.verifyMobile = (code) ->
        scope.status.busy = true

        success = () ->
          scope.code = ''
          scope.errors.verify = ''
          scope.status.busy = false
          scope.onSuccess()

        error = (message) ->
          scope.errors.verify = message
          scope.status.busy = false

        Wallet.verifyMobile(code, success, error)

  }
)
