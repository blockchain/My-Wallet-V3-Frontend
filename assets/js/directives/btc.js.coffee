walletApp.directive('btc', () ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      btc: '=btc'
    }
    template: "<span>{{ displayBtc }}</span>"
    link: (scope, elem, attrs) ->            
      scope.$watch "btc", (newVal) ->
        update()
        
      update = () ->
        (scope.displayBtc = ""; return) unless scope.btc?
        (scope.displayBtc = ""; return) if scope.btc == ""
        (scope.displayBtc = ""; return) if isNaN(scope.btc)
        scope.displayBtc = numeral(scope.btc).divide(100000000).format("0.[0000]") + " BTC"   
  }
)