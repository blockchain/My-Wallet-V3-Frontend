walletApp.directive('tor', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      _buttonClass: '@buttonClass'
    }
    templateUrl: 'templates/tor.jade'
    link: (scope, elem, attrs) ->
      scope.buttonClass = scope._buttonClass || 'button-primary'

      scope.settings = Wallet.settings

      scope.enableBlockTOR = () ->
        Wallet.enableBlockTOR()

      scope.disableBlockTOR = () ->
        Wallet.disableBlockTOR()

  }
)
