angular.module('walletApp')
  .directive('buyQuickStart', buyQuickStart);

const ONE_DAY_MS = 86400000;

buyQuickStart.$inject = ['$rootScope', 'currency', 'buySell', 'Alerts', '$interval', '$timeout', 'modals'];

function buyQuickStart ($rootScope, currency, buySell, Alerts, $interval, $timeout, modals) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      limits: '=',
      disabled: '=',
      tradingDisabled: '=',
      tradingDisabledReason: '=',
      openPendingTrade: '&',
      pendingTrade: '=',
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
    scope.format = currency.formatCurrencyForView;

    scope.updateLastInput = (type) => scope.lastInput = type;

    scope.getExchangeRate = () => {
      stopFetchingQuote();
      startFetchingQuote();
      scope.status.busy = true;

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
      Alerts.confirm('CONFIRM_CANCEL_TRADE', {
        action: 'CANCEL_TRADE',
        cancel: 'GO_BACK'
      }).then(() => scope.pendingTrade.cancel().then(() => buySell.fetchProfile()), () => {})
        .catch((e) => { Alerts.displayError('ERROR_TRADE_CANCEL'); })
        .finally(() => scope.disabled = false);
    };

    scope.openVerificationNeeded = () => {
      let verifyDate = buySell.getExchange().profile.canTradeAfter;
      console.log('verifyDate', verifyDate);
      let days = isNaN(verifyDate) ? 1 : Math.ceil((verifyDate - Date.now()) / ONE_DAY_MS);
      let options = { windowClass: 'bc-modal sm' };
      modals.openTemplate('partials/verification-needed-modal.jade', { days }, options);
    };

    scope.getExchangeRate();
    scope.$on('$destroy', stopFetchingQuote);
    scope.$watch('modalOpen', (modalOpen) => {
      modalOpen ? stopFetchingQuote() : scope.getExchangeRate();
    });
  }
}
