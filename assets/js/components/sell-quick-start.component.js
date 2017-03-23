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

function sellQuickStartController ($scope, $rootScope, currency, buySell, Alerts, $interval, $timeout, modals, Wallet, MyWalletHelpers, $q) {
  $scope.limits = this.limits;
  $scope.currencySymbol = this.currencySymbol;
  $scope.transaction = this.transaction;
  $scope.exchangeRate = {};
  $scope.selectedCurrency = $scope.transaction.currency.code;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.error = {};
  $scope.status = { ready: true };
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;

  $scope.transaction.btc = null;

  if (['EUR', 'DKK', 'GBP'].indexOf($scope.transaction.currency.code) === -1) {
    // NOTE make EUR default if currency is not eur, dkk, or gbp
    $scope.transaction.currency = { code: 'EUR', name: 'Euro' };
  }

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  if ($scope.exchange._profile) {
    $scope.sellLimit = $scope.exchange._profile._currentLimits._bank._outRemaining;
  } else {
    $scope.sellLimit = 'n/a';
  }

  console.log('from sell quick start component', $scope)

  $scope.changeSellCurrency = (curr) => {
    console.log('changeSellCurrency', curr)
    if (curr && $scope.currencies.some(c => c.code === curr.code)) {
      $scope.transaction.currency = curr;
      this.changeCurrency(curr);
      console.log('tx.currency', $scope.transaction.currency)
    }
  }

  $scope.increaseLimit = () => {
    // TODO
    console.log('show kyc here')
  }

  (() => {
    $scope.kyc = buySell.kycs[0];
    console.log('ran scope.kyc', $scope)
  })()

  // $scope.establishKyc();

  $scope.updateLastInput = (type) => $scope.lastInput = type;

  $scope.getExchangeRate = () => {
    $scope.status.fetching = true;

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
    // $scope.initializePayment();
    $scope.quote = quote;
    $scope.status = {};
    Alerts.clear();
  };

  const error = () => {
    console.error('error fetching quote')
    $scope.status = {};
    Alerts.displayError('ERROR_QUOTE_FETCH');
  };

  $scope.triggerSell = () => {
    $scope.status.waiting = true;
    buySell.getSellQuote($scope.transaction.fiat, $scope.transaction.currency.code, 'BTC').then(success, error).then(() => {
      console.log('then sell')
      $scope.$parent.sell({ fiat: $scope.transaction.fiat, btc: $scope.transaction.btc, quote: $scope.quote })
    })
  };

  $scope.getExchangeRate();


  // TODO commented this out for dev
  $scope.$watch('transaction.btc', (newVal, oldVal) => {
    if (newVal >= $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = true;
    } else if (newVal < $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = false;
    }
  });

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  // $scope.initializePayment = () => {
  //   $scope.status.busy = true;
  //   $scope.transaction['fee'] = {};
  //   const index = Wallet.getDefaultAccountIndex();
  //   $scope.payment = Wallet.my.wallet.createPayment();
  //   const tradeInSatoshi = currency.convertToSatoshi($scope.transaction.btc, currency.bitCurrencies[0])
  //   $scope.payment.from(index).amount(tradeInSatoshi)
  //
  //   $scope.payment.sideEffect(result => {
  //     console.log('sideEffect', result)
  //
  //
  //     if (firstBlockFee === 0) {
  //       console.warn('fee is zero')
  //     } else {
  //       const firstBlockFee = result.absoluteFeeBounds[0];
  //       console.log('firstBlockFee in satoshi and btc', firstBlockFee, firstBlockFee / 100000000)
  //       $scope.payment.fee(firstBlockFee);
  //       $scope.firstBlockFee = firstBlockFee !== 0 ? firstBlockFee : null;
  //       const btcRequired = $scope.transaction.btc + firstBlockFee / 100000000;
  //       const maxAvail = $scope.assignMaxAvailable(firstBlockFee);
  //
  //       console.log('maxAvail < btcRequired', maxAvail < btcRequired)
  //       if (maxAvail < btcRequired) {
  //         console.warn('Houston, we have a problem', maxAvail, btcRequired)
  //         $scope.useMaxAvailable = true;
  //
  //       }
  //
  //       $scope.transaction['fee']['btc'] = currency.convertFromSatoshi(firstBlockFee, currency.bitCurrencies[0]);
  //       const amountAfterFee = $scope.transaction.btc + $scope.transaction.fee.btc;
  //       $scope.payment.amount(amountAfterFee / 100000000) // in SATOSHI
  //     }
  //
  //     /*
  //
  //
  //
  //
  //
  //
  //     */
  //
  //     // $scope.transaction.btcAfterFee = parseFloat(amountAfterFee.toFixed(8));
  //     // console.log('math!', $scope.maxAvailable() - $scope.transaction.btc < 0)
  //     // if ($scope.maxAvailable() - $scope.transaction.btc < 0) {
  //     //   console.log('need to do use total minus fee')
  //     // }
  //
  //     // $q.resolve(currency.getFiatAtTime(+ new Date(), $scope.totalBalance * 100000000, $scope.transaction.currency.code))
  //     //   .then((fiat) => { console.log('fiat', fiat) })
  //     //   .catch(() => { scope.loadFailed = true; });
  //
  //     $scope.status = {};
  //   })
  // };


  // $scope.assignMaxAvailable = (fee) => {
  //   if (fee === 0) console.warn('fee is zero in maxAvailable')
  //   $scope.transaction.maxAvailable = $scope.totalBalance - fee / 100000000;
  //   return $scope.totalBalance - fee / 100000000;
  // }

// tx.maxAvailable = $scope.advanced ? data.balance - tx.fee : data.sweepAmount;
// if (tx.maxAvailable < 0) tx.maxAvailable = 0;

}
