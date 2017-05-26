
angular
  .module('walletApp')
  .directive('transactionPending', transactionPending);

function transactionPending ($rootScope, $translate) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      transaction: '='
    },
    templateUrl: 'templates/transaction-pending.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.complete = scope.transaction.confirmations >= 3;

    scope.pendingMessage = (transaction) => {
      switch (transaction.txType) {
        case 'sent':
          scope.message = 'PENDING_TX_SENDER';
          break;
        case 'received':
          scope.message = 'PENDING_TX_RECEIVER';
          break;
        case 'transfer':
          scope.message = 'PENDING_TX_SENDER';
          break;
      }
    };
    scope.pendingMessage(scope.transaction);
  }
}
