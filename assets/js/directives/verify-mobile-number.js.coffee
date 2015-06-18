walletApp.directive('verifyMobileNumber', ($translate, Wallet, $filter) ->
  {
    restrict: "E"
    replace: true
    scope: {
      setStep: '='
    }
    templateUrl: 'templates/verify-mobile-number.jade'
    link: (scope, elem, attrs) ->      
      scope.status = {busy: false}
      scope.errors = {verify: null}

      if attrs.buttonLg?
        scope.buttonLg = true

      if attrs.fullWidth?
        scope.fullWidth = true
    
      scope.verifyMobile = (code) ->
        scope.status.busy = true
        
        success = () ->
          scope.status.busy = false
          scope.setStep(0)
          
        error = (message) ->
          scope.errors.verify = message
          scope.status.busy = false
          
        Wallet.verifyMobile(code, success, error)

  }
)
