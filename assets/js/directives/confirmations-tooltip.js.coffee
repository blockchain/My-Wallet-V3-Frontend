walletApp.directive('confirmationsTooltip', ($compile, $translate) ->
  {
    restrict: "A"
    replace: 'false'
    scope: {
      confirmationsTooltip: '='
    }
    link: (scope, elem, attrs) ->
      elem.removeAttr("confirmations-tooltip")
      
      scope.transaction = scope.confirmationsTooltip
      
      confirmations = scope.confirmationsTooltip.confirmations
      
      if confirmations == undefined || confirmations == null
        scope.tooltip = ""
      else if confirmations == 0
        $translate("UNCONFIRMED").then (response) ->
          scope.tooltip = response
      else if confirmations == 1
        $translate("ONE_CONFIRMATION").then (response) ->
          scope.tooltip = response
      else
        $translate("N_CONFIRMATIONS", {n: confirmations}).then (response) ->
          scope.tooltip = response
                  
      scope.$watch "tooltip", (newVal) ->
        elem.attr("tooltip", newVal)
        $compile(elem)(scope)
  }
)