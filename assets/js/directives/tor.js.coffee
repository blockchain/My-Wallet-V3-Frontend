walletApp.directive('tor', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/tor.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.enableBlockTOR = () ->
        Wallet.enableBlockTOR()
  
      scope.disableBlockTOR = () ->
        Wallet.disableBlockTOR()
    
  }
)






