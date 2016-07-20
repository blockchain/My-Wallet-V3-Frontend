angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

buyQuickStart.$inject = ['currency'];

function buyQuickStart (currency) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      changeCurrency: '&',
      transaction: '='
    },
    templateUrl: 'templates/buy-quick-start.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attr) {
    scope.currencies = currency.coinifyCurrencies;
    scope.isCurrencySelected = (currency) => currency === scope.transaction.currency;
  }
}
