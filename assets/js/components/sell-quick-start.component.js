angular
  .module('walletApp')
  .component('sellQuickStart', {
    bindings: {
      sell: '&',
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
    templateUrl: 'templates/sell-quick-start.pug',
    controller: sellQuickStartController,
    controllerAs: '$ctrl'
  });

const ONE_DAY_MS = 86400000;

// sellQuickStart.$inject = ['$rootScope', 'currency', 'buySell', 'Alerts', '$interval', '$timeout', 'modals'];

function sellQuickStartController ($scope, $rootScope, currency, buySell, Alerts, $interval, $timeout, modals, Wallet, MyWalletHelpers) {
  $scope.limits = this.limits;
  $scope.currencySymbol = this.currencySymbol;
  $scope.transaction = this.transaction;
  $scope.exchangeRate = {};
  $scope.selectedCurrency = $scope.transaction.currency.code;
  $scope.currencies = currency.coinifyCurrencies;
  console.log('from sell quick start component', $scope)

  $scope.changeSellCurrency = (curr) => {
    $scope.selectedCurrency = curr.code;
    $scope.transaction.currency.code = curr.code;
    $scope.transaction.currency.name = currency.coinifyCurrencies[curr.code];
    console.log('change sell currency - scope.transaction', $scope.transaction.currency)
    $scope.getExchangeRate(); // get new quote when user changes their preferred currency

  };

  $scope.increaseLimit = () => {
    // TODO
    console.log('show kyc here')
  }

  $scope.updateLastInput = (type) => $scope.lastInput = type;

  $scope.getExchangeRate = () => {
    // stopFetchingQuote();
    // startFetchingQuote();
    // $scope.status.busy = true;

    buySell.getQuote(-1, 'BTC', $scope.transaction.currency.code).then(function (quote) {
      $scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
    }, error).finally($scope.getQuote);
  };

  $scope.getQuote = () => {
    if ($scope.lastInput === 'btc') {
      buySell.getSellQuote($scope.transaction.btc, 'BTC', $scope.transaction.currency.code).then(success, error);
    } else if ($scope.lastInput === 'fiat') {
      buySell.getSellQuote($scope.transaction.fiat, $scope.transaction.currency.code, 'BTC').then(success, error);
    } else {
      $scope.status = {};
    }
  };

  const success = (quote) => {
    if (quote.quoteCurrency === 'BTC') {
      $scope.transaction.btc = -quote.quoteAmount / 100000000;
    } else {
      $scope.transaction.fiat = -quote.quoteAmount / 100;
    }
    $scope.quote = quote;
    $scope.status = {};
    Alerts.clear();
  };

  const error = () => {
    console.log('GOT AN ERRRRRRR fetching quote')
    $scope.status = {};
    Alerts.displayError('ERROR_QUOTE_FETCH');
  };

  $scope.triggerSell = () => {
    $scope.$parent.sell({ fiat: $scope.transaction.fiat, btc: $scope.transaction.btc, quote: $scope.quote });
  };

  $scope.getExchangeRate();

  // -------- OLD DIRECTIVE CODE BELOW -------- //

  // const directive = {
  //   restrict: 'E',
  //   replace: true,
  //   scope: {
  //     buy: '&',
  //     limits: '=',
  //     disabled: '=',
  //     tradingDisabled: '=',
  //     tradingDisabledReason: '=',
  //     openPendingTrade: '&',
  //     pendingTrade: '=',
  //     modalOpen: '=',
  //     transaction: '=',
  //     currencySymbol: '=',
  //     changeCurrency: '&'
  //   },
  //   templateUrl: 'templates/buy-quick-start.jade',
  //   link: link
  // };
  // return directive;

  function link (scope, elem, attr) {
    scope.exchangeRate = {};
    scope.status = {ready: true};
    scope.currencies = currency.coinifyCurrencies;
    scope.format = currency.formatCurrencyForView;

    scope.updateLastInput = (type) => scope.lastInput = type;
    scope.isPendingTradeState = (state) => scope.pendingTrade && scope.pendingTrade.state === state;

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
      buySell.cancelTrade(scope.pendingTrade).finally(() => scope.disabled = false);
    };

    scope.getDays = () => {
      let verifyDate = buySell.getExchange().profile.canTradeAfter;
      return isNaN(verifyDate) ? 1 : Math.ceil((verifyDate - Date.now()) / ONE_DAY_MS);
    };

    scope.getExchangeRate();
    scope.$on('$destroy', stopFetchingQuote);
    scope.$watch('modalOpen', (modalOpen) => {
      modalOpen ? stopFetchingQuote() : scope.getExchangeRate();
    });
  }
}
