walletApp.directive('networkFeePicker', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
    }
    templateUrl: 'templates/network-fee-picker.html'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      
      scope.translations = {
        frugal: ""
        normal: ""
        generous: ""
      }
            
      $translate("FEE_FRUGAL").then (translation) ->
        scope.translations.frugal = translation.toUpperCase()

      $translate("FEE_NORMAL").then (translation) ->
        scope.translations.normal = translation.toUpperCase()

      $translate("FEE_GENEROUS").then (translation) ->
        scope.translations.generous = translation.toUpperCase()
        
      scope.$watch "settings.feePolicy", (newValue) ->        
        scope.policy = newValue
              
      scope.$watch "policy", (policy, previousPolicy) ->
        if previousPolicy? && policy isnt previousPolicy && (policy == -1 || policy == 0 || policy == 1)
          Wallet.setFeePolicy(policy)
  }
)