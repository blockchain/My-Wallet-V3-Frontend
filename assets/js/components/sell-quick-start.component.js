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
      changeCurrency: '&',
      onTrigger: '&'
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
  // $scope.currencySymbol = currency.conversions['EUR']; // default to Euro
  $scope.error = {};
  $scope.status = { ready: true };

  $scope.transaction.btc = null;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  if ($scope.exchange._profile) {
    $scope.sellLimit = $scope.exchange._profile._currentLimits._bank._outRemaining;
  } else {
    $scope.sellLimit = 'n/a';
  }

  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;

  console.log('from sell quick start component', $scope)

  $scope.changeSellCurrency = (curr) => {
    console.log('changeSellCurrency', curr)
    $scope.status.fetching = true;
    if (curr && $scope.currencies.some(c => c.code === curr.code)) {
      $scope.transaction.currency = curr;
      this.changeCurrency(curr);
      console.log('tx.currency', $scope.transaction.currency)
    }
  }

  // $scope.changeCurrency = (curr) => {
  //   console.log('changeCurrency', curr)
  //   $scope.status['fetching'] = true;
  //   if (curr && $scope.currencies.some(c => c.code === curr.code)) {
  //     $scope.transaction.currency = curr;
  //     this.changeCurrency(curr);
  //     console.log('tx.currency', $scope.transaction.currency)
  //   }
  // }

  // $scope.changeCurrencySymbol = (curr) => {
  //   if (typeof curr.code === 'object') {
  //     $scope.currencySymbol = currency.conversions[curr.code.code];
  //   } else {
  //     $scope.currencySymbol = currency.conversions[curr.code];
  //   }
  // };
  // $scope.changeCurrencySymbol($scope.transaction.currency);

  $scope.increaseLimit = () => {
    // TODO
    console.log('show kyc here')
  }

  $scope.updateLastInput = (type) => $scope.lastInput = type;

  $scope.getExchangeRate = () => {
    buySell.getQuote(-1, 'BTC', $scope.transaction.currency.code).then(function (quote) {
      $scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
    }, error).finally($scope.getQuote);
  };

  $scope.getQuote = () => {
    $scope.status.busy = true;
    if ($scope.lastInput === 'btc') {
      buySell.getSellQuote($scope.transaction.btc, 'BTC', $scope.transaction.currency.code).then(success, error);
    } else if ($scope.lastInput === 'fiat') {
      buySell.getSellQuote($scope.transaction.fiat, $scope.transaction.currency.code, 'BTC').then(success, error);
    } else {
      $scope.status = { busy: false };
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
    buySell.getSellQuote($scope.transaction.fiat, $scope.transaction.currency.code, 'BTC').then(success, error).then(() => {
      $scope.$parent.sell({ fiat: $scope.transaction.fiat, btc: $scope.transaction.btc, quote: $scope.quote })
    })
  };

  $scope.getExchangeRate();



  $scope.$watch('transaction.btc', (newVal, oldVal) => {
    if (newVal >= $scope.totalBalance) {
      console.log('moreThanInWallet error')
      $scope.error['moreThanInWallet'] = true;
    } else if (newVal < $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = false;
    }
  });

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

}
