walletApp.directive('amount', () ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '=transaction'
    }
    templateUrl: 'templates/amount.jade'
    link: (scope, elem, attrs) ->
      scope.btc = attrs.btc? # May not work correctly within ng-repeat
  }
)