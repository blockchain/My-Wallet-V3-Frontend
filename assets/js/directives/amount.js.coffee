walletApp.directive('amount', (Wallet , $compile) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '=transaction'
    }
    templateUrl: 'templates/amount.html'
    link: (scope, elem, attrs) ->        
        
  }
)