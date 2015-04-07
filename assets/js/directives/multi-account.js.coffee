walletApp.directive('multiAccount', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/multi-account.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.enableMultiAccount = () ->
        Wallet.setMultiAccount(true)
  
      scope.disableMultiAccount = () ->
        Wallet.setMultiAccount(false)
    
  }
)