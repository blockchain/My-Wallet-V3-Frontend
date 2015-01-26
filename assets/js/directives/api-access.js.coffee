walletApp.directive('apiAccess', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/api-access.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.enableApiAccess = () ->
        Wallet.enableApiAccess()
  
      scope.disableApiAccess = () ->
        Wallet.disableApiAccess()
    
  }
)






