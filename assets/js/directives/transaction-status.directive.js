
angular
  .module('walletDirectives')
  .directive('transactionStatus', transactionStatus);

function transactionStatus ($rootScope) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      transaction: '='
    },
    templateUrl: 'templates/transaction-status.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.verify = () => {
      window.open($rootScope.rootURL + 'tx/' + scope.transaction.hash, '_blank');
    };

    scope.$watch('transaction.confirmations', () => {
      if (scope.transaction && scope.transaction.confirmations != null) {
        scope.minutesRemaining = 30 - scope.transaction.confirmations * 10;
        scope.complete = scope.transaction.confirmations >= 3;
        scope.frugalWarning = scope.transaction.frugal && scope.transaction.confirmations === 0;
      }
    });
  }
}
