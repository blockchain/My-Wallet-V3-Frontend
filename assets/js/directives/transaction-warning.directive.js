
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
    let warnings = ['rbf', 'double_spend'];

    let messages = {
      'rbf': 'TX_RBF',
      'double_spend': 'DOUBLE_SPEND',
      'rbf_double_spend': 'TX_RBF_AND_DOUBLE_SPEND'
    };

    let warning = warnings.filter((w) => scope.tx[w] === true);

    scope.message = warning && warning.length > 1 ? messages['rbf_double_spend'] : messages[warning];
  }
}
