walletApp.directive('transactionStatus', ($translate, $rootScope, Wallet, $compile, $sce) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '='
    }
    templateUrl: 'templates/transaction-status.jade'
    link: (scope, elem, attrs) ->
      scope.$watch "transaction.confirmations", () ->
        if scope.transaction? && scope.transaction.confirmations?
          scope.minutesRemaining = 30 - scope.transaction.confirmations * 10
          scope.complete = scope.transaction.confirmations >= 3
          scope.frugalWarning = scope.transaction.frugal && scope.transaction.confirmations == 0
  }
)