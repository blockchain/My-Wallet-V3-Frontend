
angular
  .module('walletDirectives')
  .directive('transactionWarning', transactionWarning);

function transactionWarning () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      tx: '=transaction'
    },
    templateUrl: 'templates/transaction-warning.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
  }
}
