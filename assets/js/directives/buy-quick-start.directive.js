angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

buyQuickStart.$inject = ['currency', 'buySell', 'Alerts', '$interval'];

function buyQuickStart (currency, buySell, Alerts, $interval) {
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

    scope.triggerBuy = () => {
      scope.buy({ amt: scope.transaction.fiat });
    };

    let fetchingQuote;
    let startFetchingQuote = () => {
      fetchingQuote = $interval(() => scope.getQuote(), 1000 * 60);
    };

    let stopFetchingQuote = () => {
      $interval.cancel(fetchingQuote);
    };

    scope.getQuote = () => {
      stopFetchingQuote();
      startFetchingQuote();
      scope.status.waiting = true;
      scope.transaction.fiat && buySell.getQuote(scope.transaction.fiat, scope.transaction.currency.code).then(success, error);
    };

    const success = (quote) => {
      scope.quote = quote;
      scope.status = {};
      Alerts.clear();
    };

    const error = () => {
      Alerts.displayError('ERROR_QUOTE_FETCH');
    };

    scope.$on('$destroy', stopFetchingQuote);
  }
}
