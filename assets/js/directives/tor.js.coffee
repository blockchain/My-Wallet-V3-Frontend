walletApp.directive('tor', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      buttonClass: '@'
    }
    templateUrl: 'templates/tor.jade'
    link: (scope, elem, attrs) ->
      unless scope.buttonClass?
        scope.buttonClass = 'button-primary'

      scope.settings = Wallet.settings

      scope.enableBlockTOR = () ->
        Wallet.enableBlockTOR()

      scope.disableBlockTOR = () ->
        Wallet.disableBlockTOR()

  }
)
