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
    scope.exchangeRate = {};
    scope.currencies = currency.coinifyCurrencies;

    scope.getExchangeRate = () => {
      buySell.getQuote(-1, 'BTC', scope.transaction.currency.code).then((quote) => {
        scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
      }, error);
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
      scope.getExchangeRate();
      scope.status.waiting = true;
      scope.transaction.fiat && buySell.getQuote(scope.transaction.fiat, scope.transaction.currency.code).then(success, error);
      scope.transaction.btc && buySell.getQuote(-scope.transaction.btc, 'BTC', scope.transaction.currency.code).then(success, error);
    };

    const success = (quote) => {
      scope.transaction.fiat
        ? scope.transaction.btc = quote.quoteAmount / 100000000
        : scope.transaction.fiat = -quote.quoteAmount / 100;
      scope.quote = quote;
      scope.status = {};
      Alerts.clear();
    };

    const error = () => {
      Alerts.displayError('ERROR_QUOTE_FETCH');
    };

    scope.getExchangeRate();
    scope.$on('$destroy', stopFetchingQuote);
  }
}
