angular
  .module('walletApp')
  .component('sellQuickStart', {
    bindings: {
      sell: '&',
      disabled: '=',
      tradingDisabled: '=',
      tradingDisabledReason: '=',
      openPendingTrade: '&',
      pendingTrade: '=',
      modalOpen: '=',
      transaction: '<',
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
  $scope.exchangeRate = {};
  $scope.tradingDisabled = this.tradingDisabled;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.error = {};
  $scope.status = { ready: true };
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;
  $scope.selectedCurrency = this.transaction.currency.code;
  $scope.transaction = this.transaction;
  $scope.format = currency.formatCurrencyForView;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  $scope.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  if ($scope.exchange._profile) {
    $scope.sellLimit = $scope.exchange._profile._currentLimits._bank._outRemaining.toString();
    $scope.hideIncreaseLimit = $scope.exchange._profile._level._name > 1;
  }

  $scope.isPendingSellTrade = (state) => this.pendingTrade && this.pendingTrade.state === state && this.pendingTrade.medium === 'blockchain';
  $scope.isPendingTradeState = (state) => this.pendingTrade && this.pendingTrade.state === state && this.pendingTrade.medium !== 'blockchain';

  $scope.initializeCurrencyAndSymbol = () => {
    const setInitialCurrencyAndSymbol = (code, name) => {
      this.transaction.currency = { code: code, name: name };
      this.sellCurrencySymbol = currency.conversions[code];
      $scope.limitsCurrencySymbol = currency.conversions[code];
    };

    if ($scope.exchangeCountry === 'DK') {
      setInitialCurrencyAndSymbol('DKK', 'Danish Krone');
    } else if ($scope.exchangeCountry === 'GB') {
      setInitialCurrencyAndSymbol('GBP', 'Great British Pound');
    } else {
      setInitialCurrencyAndSymbol('EUR', 'Euro');
    }
  };
  $scope.initializeCurrencyAndSymbol();

  $scope.changeSymbol = (curr) => {
    if (curr && $scope.currencies.some(c => c.code === curr.currency.code)) {
      this.sellCurrencySymbol = currency.conversions[curr.currency.code];
    }
  };

  (() => {
    $scope.kyc = exchange.kycs[0];
  })();

  $scope.updateLastInput = (type) => $scope.lastInput = type;

  $scope.getInitialExchangeRate = () => {
    $scope.status.fetching = true;

    buySell.getQuote(-1, 'BTC', this.transaction.currency.code)
      .then(quote => {
        $scope.getMinLimits(quote);
        $scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
        $scope.status = {};
      }, error).finally($scope.getQuote);
  };

  $scope.getExchangeRate = () => {
    let rate, fiat;
    let { baseAmount, quoteAmount, baseCurrency } = $scope.quote;

    if (baseCurrency === 'BTC') {
      rate = 1 / (baseAmount / 100000000);
      fiat = quoteAmount / 100;
    } else {
      rate = 1 / (quoteAmount / 100000000);
      fiat = baseAmount / 100;
    }
    return Math.abs((rate * fiat)).toFixed(2);
  };

  $scope.getQuote = () => {
    $scope.status.fetching = true;
    $scope.status.busy = true;
    if ($scope.lastInput === 'btc') {
      buySell.getSellQuote(-this.transaction.btc, 'BTC', this.transaction.currency.code).then(success, error);
    } else if ($scope.lastInput === 'fiat') {
      buySell.getSellQuote(this.transaction.fiat, this.transaction.currency.code, 'BTC').then(success, error);
    } else {
      $scope.status = { busy: false };
    }
  };

  const success = (quote) => {
    $scope.status = {};
    $scope.quote = quote;
    $scope.exchangeRate.fiat = $scope.getExchangeRate();

    if (quote.quoteCurrency === 'BTC') {
      this.transaction.btc = -quote.quoteAmount / 100000000;
    } else {
      this.transaction.fiat = quote.quoteAmount / 100;
    }

    Alerts.clear();
  };

  const error = () => {
    $scope.status = {};
    Alerts.displayError('ERROR_QUOTE_FETCH');
  };

  $scope.triggerSell = () => {
    $scope.status.waiting = true;
    $scope.quote.getPayoutMediums().then(mediums => {
      $scope.$parent.sell(
        { fiat: this.transaction.fiat, btc: this.transaction.btc, quote: $scope.quote },
        { bank: mediums.bank },
        { sell: true, isSweepTransaction: $scope.isSweepTransaction }
      );
    });
    $scope.status = {};
    $timeout(() => {
      this.transaction = { currency: {} };
      $scope.initializeCurrencyAndSymbol();
    }, 1000);
  };

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

  $scope.checkForNoFee = () => {
    $scope.status.busy = true;
    if (!this.transaction || !this.transaction.btc || $scope.isSweepTransaction) return;
    let tradeInSatoshi = currency.convertToSatoshi(this.transaction.btc, currency.bitCurrencies[0]);
    let index = Wallet.getDefaultAccountIndex();
    let pmt = Wallet.my.wallet.createPayment();
    pmt.from(index).amount(tradeInSatoshi);
    pmt.sideEffect(r => {
      if (r.absoluteFeeBounds[0] === 0) {
        $scope.error['moreThanInWallet'] = true;
        $scope.offerUseAll();
      } else {
        $scope.status = {};
      }
    });
  };

  $scope.cancelTrade = () => {
    $scope.disabled = true;
    buySell.cancelTrade(this.pendingTrade).finally(() => $scope.disabled = false);
  };

  $scope.offerUseAll = () => {
    $scope.status.busy = true;
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

  $scope.handleCurrencyClick = (curr) => {
    this.changeCurrency(curr);
    $scope.changeSymbol(curr);
    $scope.getQuote();
  };

  $scope.multipleAccounts = () => Wallet.accounts().length > 1;

  $scope.useAll = () => {
    this.transaction.btc = $scope.sweepAmount / 100000000;
    $scope.isSweepTransaction = true;
    $scope.status.busy = true;
    buySell.getSellQuote(-this.transaction.btc, 'BTC', this.transaction.currency.code).then(success, error);
  };

  $scope.$watch('$ctrl.transaction.btc', (newVal, oldVal) => {
    if ($scope.totalBalance === 0) {
      $scope.tradingDisabled = true;
      $scope.showZeroBalance = true;
      return;
    }
    if (newVal >= $scope.totalBalance) {
      $scope.error['moreThanInWallet'] = true;
      $scope.offerUseAll();
    } else if (newVal < $scope.totalBalance) {
      $scope.checkForNoFee();
      $scope.error['moreThanInWallet'] = false;
    } else if (!newVal) {
      $scope.checkForNoFee();
      $scope.error['moreThanInWallet'] = false;
    }
  });

  $scope.getMinLimits = (quote) => {
    buySell.getMinLimits(quote).then($scope.limits = buySell.limits);
  };

  $scope.getInitialExchangeRate();
}
