walletApp.directive('configureSecondPassword', ($translate, Wallet, $modal) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      securityCenter: '='
    }
    templateUrl: 'templates/configure-second-password.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.removeSecondPassword = () ->
        return if scope.busy
          
        scope.busy = true
        
        success = () ->
          scope.busy = false
          
        error = () ->
          scope.busy = false
          
        Wallet.removeSecondPassword(success, error)
    
      scope.setSecondPassword = () ->
        modalInstance = $modal.open(
          templateUrl: "partials/settings/set-second-password.jade"
          controller: SetSecondPasswordCtrl
          windowClass: "bc-modal"
        ).opened.then () ->
          Wallet.store.resetLogoutTimeout()
  }
)






