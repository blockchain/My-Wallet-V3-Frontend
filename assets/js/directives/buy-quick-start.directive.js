angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

buyQuickStart.$inject = ['currency', 'buySell', 'Alerts', '$interval', '$timeout'];

function buyQuickStart (currency, buySell, Alerts, $interval, $timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      limits: '=',
      modalOpen: '=',
      transaction: '=',
      currencySymbol: '=',
      changeCurrency: '&'
    },
    templateUrl: 'templates/buy-quick-start.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attr) {
    scope.exchangeRate = {};
    scope.status = {ready: true};
    scope.currencies = currency.coinifyCurrencies;

    scope.updateLastInput = (type) => scope.lastInput = type;

    scope.getExchangeRate = () => {
      stopFetchingQuote();
      startFetchingQuote();

      buySell.getQuote(-1, 'BTC', scope.transaction.currency.code).then((quote) => {
        scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
      }, error).finally(scope.getQuote);
    };

    scope.isCurrencySelected = (currency) => currency === scope.transaction.currency;

    scope.triggerBuy = () => {
      scope.buy({ fiat: scope.transaction.fiat, btc: scope.transaction.btc, quote: scope.quote });
    };

    let fetchingQuote;
    let startFetchingQuote = () => {
      fetchingQuote = $interval(() => scope.getExchangeRate(), 1000 * 60);
    };

    let stopFetchingQuote = () => {
      $interval.cancel(fetchingQuote);
    };

    scope.getQuote = () => {
      scope.status.busy = true;

      if (scope.lastInput === 'btc') {
        buySell.getQuote(-scope.transaction.btc, 'BTC', scope.transaction.currency.code).then(success, error);
      } else if (scope.lastInput === 'fiat') {
        buySell.getQuote(scope.transaction.fiat, scope.transaction.currency.code).then(success, error);
      } else {
        scope.status = {};
      }
    };

    const success = (quote) => {
      if (quote.baseCurrency === 'BTC') {
        scope.transaction.fiat = -quote.quoteAmount / 100;
      } else {
        scope.transaction.btc = quote.quoteAmount / 100000000;
      }
      scope.quote = quote;
      scope.status = {};
      Alerts.clear();
    };

    const error = () => {
      scope.status = {};
      Alerts.displayError('ERROR_QUOTE_FETCH');
    };

    scope.getExchangeRate();
    scope.$on('$destroy', stopFetchingQuote);
    scope.$watch('modalOpen', (modalOpen) => {
      modalOpen ? stopFetchingQuote() : scope.getQuote();
    });
  }
}
