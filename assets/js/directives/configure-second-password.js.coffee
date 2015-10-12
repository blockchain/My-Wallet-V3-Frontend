angular.module('walletApp').directive('configureSecondPassword', ($translate, Wallet, $uibModal) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/configure-second-password.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings

      scope.removeSecondPassword = () ->
        return if scope.busy

        scope.busy = true

        success = () ->
          scope.busy = false
          Wallet.saveActivity(2)

        error = () ->
          scope.busy = false

        Wallet.removeSecondPassword(success, error)

      scope.setSecondPassword = () ->
        modalInstance = $uibModal.open(
          templateUrl: "partials/settings/set-second-password.jade"
          controller: "SetSecondPasswordCtrl"
          windowClass: "bc-modal"
        ).opened.then () ->
          Wallet.store.resetLogoutTimeout()
  }
)
