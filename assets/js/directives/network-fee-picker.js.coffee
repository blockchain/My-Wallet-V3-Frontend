walletApp.directive('networkFeePicker', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
    }
    templateUrl: 'templates/network-fee-picker.html'
    link: (scope, elem, attrs) ->
      scope.policies = [{value: -1, name: ""}, {value: 0, name: ""}, {value: 1, name: ""}]
      scope.settings = Wallet.settings
            
      $translate("FRUGAL").then (translation) ->  
        scope.policies[0].name = translation.toUpperCase()
        
      $translate("NORMAL").then (translation) ->  
        scope.policies[1].name = translation.toUpperCase()
      
      $translate("GENEROUS").then (translation) ->  
        scope.policies[2].name = translation.toUpperCase()
        
      scope.$watch "settings.feePolicy", (newValue) ->        
        scope.selectedPolicy = scope.policies[newValue + 1]
              
      scope.didSelect = (item, model) ->
        Wallet.setFeePolicy(item.value)
  }
)