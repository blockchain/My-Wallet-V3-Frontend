angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

buyQuickStart.$inject = ['currency', 'buySell'];

function buyQuickStart (currency, buySell) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      limits: '=',
      transaction: '=',
      currencySymbol: '=',
      changeCurrency: '&'
    },
    templateUrl: 'templates/buy-quick-start.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attr) {
    scope.status = {ready: true};
    scope.currencies = currency.coinifyCurrencies;

    scope.defaultAmts = {
      'DKK': [100, 1000, 2000],
      'USD': [20, 100, 250],
      'EUR': [20, 100, 250],
      'GBP': [20, 100, 200]
    };

    scope.isCurrencySelected = (currency) => currency === scope.transaction.currency;

    scope.$watchGroup(['transaction.currency', 'transaction.fiat'], (newVal, oldVal) => {
      if (!scope.transaction.currency || !scope.transaction.fiat) {
        scope.quote = undefined; return;
      }

      if (newVal !== oldVal) {
        const success = (quote) => {
          scope.quote = quote;
          scope.status = {};
        };

        buySell.getQuote(scope.transaction.fiat, scope.transaction.currency.code).then(success);
      }
    });
  }
}
