
angular
  .module('walletApp')
  .directive('transactionStatus', transactionStatus);

function transactionStatus ($rootScope, BrowserHelper) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      transaction: '='
    },
    templateUrl: 'templates/transaction-status.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.verify = () => {
      BrowserHelper.safeWindowOpen($rootScope.rootURL + 'tx/' + scope.transaction.hash);
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
