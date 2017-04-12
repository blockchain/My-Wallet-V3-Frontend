angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

buyQuickStart.$inject = ['$rootScope', 'currency', 'buySell', 'Alerts', '$interval', '$timeout', 'modals'];

function buyQuickStart ($rootScope, currency, buySell, Alerts, $interval, $timeout, modals) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      disabled: '=',
      tradingDisabled: '=',
      tradingDisabledReason: '=',
      openPendingTrade: '&',
      pendingTrade: '=',
      modalOpen: '=',
      transaction: '=',
      changeCurrency: '&',
      getDays: '&'
    },
    templateUrl: 'templates/buy-quick-start.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attr) {
    scope.exchangeRate = {};
    scope.status = {ready: true};
    scope.currencies = currency.coinifyCurrencies;
    scope.format = currency.formatCurrencyForView;
    scope.inMobileBuy = $rootScope.inMobileBuy;

    scope.updateLastInput = (type) => scope.lastInput = type;
    scope.isPendingTradeState = (state) => scope.pendingTrade && scope.pendingTrade.state === state && scope.pendingTrade.medium !== 'blockchain';
    scope.isPendingSellTrade = (state) => scope.pendingTrade && scope.pendingTrade.state === state && scope.pendingTrade.medium === 'blockchain';

    scope.getExchangeRate = () => {
      stopFetchingQuote();
      startFetchingQuote();
      scope.status.busy = true;

      buySell.getQuote(-1, 'BTC', scope.transaction.currency.code).then((quote) => {
        scope.getMinLimits(quote);
        scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
      }, error).finally(scope.getQuote);
    };

    scope.isCurrencySelected = (currency) => currency === scope.transaction.currency;

    let fetchingQuote;
    let startFetchingQuote = () => {
      fetchingQuote = $interval(() => scope.getExchangeRate(), 1000 * 60);
    };

    let stopFetchingQuote = () => {
      $interval.cancel(fetchingQuote);
    };

    scope.getQuote = () => {
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

    scope.cancelTrade = () => {
      scope.disabled = true;
      buySell.cancelTrade(scope.pendingTrade).finally(() => scope.disabled = false);
    };

    scope.getMinLimits = (quote) => {
      buySell.getMinLimits(quote).then(scope.limits = buySell.limits);
    };

    scope.getExchangeRate();
    scope.$on('$destroy', stopFetchingQuote);
    scope.$watch('modalOpen', (modalOpen) => {
      modalOpen ? stopFetchingQuote() : scope.getExchangeRate();
    });
  }
}
