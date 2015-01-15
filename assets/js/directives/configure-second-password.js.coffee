walletApp.directive('configureSecondPassword', ($translate, Wallet, $modal) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/configure-second-password.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.removeSecondPassword = () ->
        Wallet.removeSecondPassword()
    
      scope.setSecondPassword = () ->
        modalInstance = $modal.open(
          templateUrl: "partials/settings/set-second-password.jade"
          controller: SetSecondPasswordCtrl
          windowClass: "blockchain-modal"
        )
  }
)






