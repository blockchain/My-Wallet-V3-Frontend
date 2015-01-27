walletApp.directive('resendEmailConfirmation', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/resend-email-confirmation.jade'
    link: (scope, elem, attrs) ->
      scope.status = 
        loading: null
        done: null
        
      scope.user = Wallet.user
              
      scope.resendEmailConfirmation = () ->
        unless scope.loading || scope.done
          scope.status.loading = true
          scope.status.done = false
        
          success = () ->
            scope.status.loading = false
            scope.status.done = true
          
          error = () ->
            scope.status.loading = false
        
          Wallet.resendEmailConfirmation(success, error)
  
  }
)






