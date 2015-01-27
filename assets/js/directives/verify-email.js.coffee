walletApp.directive('verifyEmail', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/verify-email.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      scope.user = Wallet.user
      scope.errors = 
          emailVerificationCode: null
    
      scope.verifyEmail = (code) ->  
        error = () ->
          $translate("EMAIL_VERIFICATION_FAILED").then (translation) ->
            scope.errors.emailVerificationCode = translation
        
        success = () ->
  
        Wallet.verifyEmail(code, success, error)
  
  }
)






