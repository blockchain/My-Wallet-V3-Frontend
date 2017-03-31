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
      sellCurrencySymbol: '=',
      selectTab: '&',
      getDays: '&',
      changeCurrency: '&',
      onTrigger: '&'
    },
    templateUrl: 'templates/sell-quick-start.pug',
    controller: sellQuickStartController,
    controllerAs: '$ctrl'
  });

function sellQuickStartController ($scope, $rootScope, currency, buySell, Alerts, $interval, $timeout, modals, Wallet, MyWalletHelpers, $q, $stateParams, $uibModal) {
  $scope.limits = this.limits;
  $scope.sellCurrencySymbol = this.sellCurrencySymbol;
  $scope.sellTransaction = this.transaction;
  $scope.sellExchangeRate = {};
  $scope.changeSellCurrency = this.changeCurrency;
  $scope.tradingDisabled = this.tradingDisabled;
  $scope.tradingDisabledReason = this.tradingDisabledReason;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.error = {};
  $scope.status = { ready: true };
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;
  $scope.sellTransaction.btc = null;
  $scope.selectedCurrency = $scope.sellTransaction.currency.code;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  $scope.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  if ($scope.exchange._profile) {
    $scope.sellLimit = $scope.exchange._profile._currentLimits._bank._outRemaining.toString();
  }

  const setInitialCurrencyAndSymbol = (code, name) => {
    $scope.sellTransaction.currency = { code: code, name: name };
    $scope.sellCurrencySymbol = currency.conversions[code];
    $scope.limitsCurrencySymbol = currency.conversions[code];
  };

  if ($scope.exchangeCountry === 'DK') {
    setInitialCurrencyAndSymbol('DKK', 'Danish Krone');
  } else if ($scope.exchangeCountry === 'GB') {
    setInitialCurrencyAndSymbol('GBP', 'Great British Pound');
  } else {
    setInitialCurrencyAndSymbol('EUR', 'Euro');
  }

  console.log('quick start scope', $scope);

  $scope.changeSymbol = (curr) => {
    if (curr && $scope.currencies.some(c => c.code === curr.currency.code)) {
      $scope.sellCurrencySymbol = currency.conversions[curr.currency.code];
    }
  };

  $scope.increaseLimit = () => {
    // TODO
    console.log('show kyc here');
  };

  (() => {
    $scope.kyc = buySell.kycs[0];
  })();

  $scope.updateLastInput = (type) => $scope.lastInput = type;

  $scope.getExchangeRate = () => {
    $scope.status.fetching = true;

    buySell.getQuote(-1, 'BTC', $scope.sellTransaction.currency.code)
      .then(function (quote) {
        $scope.sellExchangeRate.fiat = (quote.quoteAmount / -100).toFixed(2);
        $scope.status = {};
      }, error);
  };

  $scope.getQuote = () => {
    $scope.status.busy = true;
    if ($scope.lastInput === 'btc') {
      buySell.getSellQuote(-$scope.sellTransaction.btc, 'BTC', $scope.sellTransaction.currency.code).then(success, error);
    } else if ($scope.lastInput === 'fiat') {
      buySell.getSellQuote($scope.sellTransaction.fiat, $scope.sellTransaction.currency.code, 'BTC').then(success, error);
    } else {
      $scope.status = { busy: false };
    }
  };

  const success = (quote) => {
    if (quote.quoteCurrency === 'BTC') {
      $scope.sellTransaction.btc = -quote.quoteAmount / 100000000;
    } else {
      $scope.sellTransaction.fiat = quote.quoteAmount / 100;
    }
    $scope.quote = quote;
    $scope.status = {};
    Alerts.clear();
  };

  const error = () => {
    $scope.status = {};
    Alerts.displayError('ERROR_QUOTE_FETCH');
  };

  $scope.triggerSell = () => {
    $scope.status.waiting = true;
    $scope.$parent.sell({ fiat: $scope.sellTransaction.fiat, btc: $scope.sellTransaction.btc, quote: $scope.quote }, { sell: true, isSweepTransaction: $scope.isSweepTransaction });
    $scope.status = {};
  };

  $scope.getExchangeRate();

  // TODO commented this out for dev
  $scope.$watch('sellTransaction.btc', (newVal, oldVal) => {
    if ($scope.totalBalance === 0) {
      $scope.tradingDisabled = true;
      $scope.showZeroBalance = true;
      return;
    }
    if (newVal >= $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = true;
      $scope.offerUseAll();
    } else if (newVal < $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = false;
    } else if (!newVal) {
      $scope.error['moreThanInWallet'] = false;
    }
  });

  $scope.request = modals.openOnce(() => {
    Alerts.clear();
    return $uibModal.open({
      templateUrl: 'partials/request.pug',
      windowClass: 'bc-modal initial',
      controller: 'RequestCtrl',
      resolve: {
        destination: () => null,
        focus: () => false
      }
    });
  });

  $scope.$watch('sellTransaction.currency', (newVal, oldVal) => {
    let curr = $scope.sellTransaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.offerUseAll = () => {
    $scope.status.busy = true;
    $scope.sellTransaction['fee'] = {};
    $scope.payment = Wallet.my.wallet.createPayment();

    const index = Wallet.getDefaultAccountIndex();
    $scope.payment.from(index);

    $scope.payment.sideEffect(result => {
      $scope.sweepAmount = result.sweepAmount;
      $scope.status = {};
      return result;
    })
    .then((paymentData) => {
      $scope.payment.useAll(paymentData.sweepFee);
    });
  };

  $scope.useAll = () => {
    $scope.sellTransaction.btc = $scope.sweepAmount / 100000000;
    $scope.isSweepTransaction = true;
    $scope.status.busy = true;
    buySell.getSellQuote(-$scope.sellTransaction.btc, 'BTC', $scope.sellTransaction.currency.code).then(success, error);
  };
}
