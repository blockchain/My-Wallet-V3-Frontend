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
  this.error = {};
  this.status = { ready: true };
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;
  $scope.selectedCurrency = this.transaction.currency.code;
  $scope.transaction = this.transaction;
  $scope.format = currency.formatCurrencyForView;

  let exchange = buySell.getExchange();
  this.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  this.exchangeCountry = exchange.profile ? exchange.profile.country : $stateParams.countryCode;
  if (this.exchange.profile.currentLimits) {
    $scope.sellLimit = this.exchange.profile.currentLimits.bank.outRemaining.toString();
    $scope.hideIncreaseLimit = this.exchange.profile.level.name > 1;
  }

  $scope.isPendingTradeState = (state) => this.pendingTrade && this.pendingTrade.state === state && this.pendingTrade.medium !== 'blockchain';
  $scope.isPendingSellTrade = () => buySell.isPendingSellTrade(this.pendingTrade);

  $scope.initializeCurrencyAndSymbol = () => {
    const setInitialCurrencyAndSymbol = (code, name) => {
      this.transaction.currency = { code: code, name: name };
      this.sellCurrencySymbol = currency.conversions[code];
      $scope.limitsCurrencySymbol = currency.conversions[code];
    };

    if (this.exchangeCountry === 'DK') {
      setInitialCurrencyAndSymbol('DKK', 'Danish Krone');
    } else if (this.exchangeCountry === 'GB') {
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
    this.status.fetching = true;

    buySell.getQuote(-1, 'BTC', this.transaction.currency.code)
      .then(quote => {
        $scope.getMinLimits(quote);
        $scope.exchangeRate.fiat = (-quote.quoteAmount / 100).toFixed(2);
        this.status = {};
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
    this.status.fetching = true;
    this.status.busy = true;
    if ($scope.lastInput === 'btc') {
      $q.resolve(buySell.getSellQuote(-this.transaction.btc, 'BTC', this.transaction.currency.code).then(success, error));
    } else if ($scope.lastInput === 'fiat') {
      $q.resolve(buySell.getSellQuote(this.transaction.fiat, this.transaction.currency.code, 'BTC').then(success, error));
    } else {
      this.status = { busy: false };
    }
  };

  const success = (quote) => {
    this.status = {};
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
    this.status = {};
    Alerts.displayError('ERROR_QUOTE_FETCH');
  };

  $scope.triggerSell = () => {
    this.status.waiting = true;
    $scope.quote.getPayoutMediums().then(mediums => {
      $scope.$parent.sell(
        { fiat: this.transaction.fiat, btc: this.transaction.btc, quote: $scope.quote },
        mediums.bank,
        $scope.payment,
        { sell: true, isSweepTransaction: $scope.isSweepTransaction }
      );
    });
    this.status = {};
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
    this.status.busy = true;
    if (!this.transaction || !this.transaction.btc) return;
    let tradeInSatoshi = currency.convertToSatoshi(this.transaction.btc, currency.bitCurrencies[0]);
    let index = Wallet.getDefaultAccountIndex();
    $scope.payment = Wallet.my.wallet.createPayment();
    $scope.payment.from(index).amount(tradeInSatoshi);
    $scope.payment.sideEffect(r => {
      if (r.finalFee === 0) {
        $scope.offerUseAll($scope.payment, r);
      } else {
        this.status = {};
      }
    });
  };

  $scope.cancelTrade = () => {
    $scope.disabled = true;
    buySell.cancelTrade(this.pendingTrade).finally(() => $scope.disabled = false);
  };

  $scope.offerUseAll = (payment, paymentInfo) => {
    this.error['moreThanInWallet'] = true;
    this.status.busy = true;
    $scope.payment = Wallet.my.wallet.createPayment(payment);
    $scope.maxSpendableAmount = paymentInfo.sweepAmount;
    let maxSweepFee = paymentInfo.sweepFee;
    $scope.payment.amount($scope.maxSpendableAmount).fee(maxSweepFee);
  };

  $scope.handleCurrencyClick = (curr) => {
    this.changeCurrency(curr);
    $scope.changeSymbol(curr);
  };

  $scope.multipleAccounts = () => Wallet.accounts().length > 1;

  $scope.useAll = () => {
    this.transaction.btc = currency.convertFromSatoshi($scope.maxSpendableAmount, currency.bitCurrencies[0]);
    $scope.isSweepTransaction = true;
    this.status.busy = true;
    buySell.getSellQuote(-this.transaction.btc, 'BTC', this.transaction.currency.code).then(success, error);
  };

  $scope.$watch('$ctrl.transaction.btc', (newVal, oldVal) => {
    if ($scope.totalBalance === 0) {
      $scope.tradingDisabled = true;
      $scope.showZeroBalance = true;
      return;
    }
    if (newVal >= $scope.totalBalance) {
      this.error['moreThanInWallet'] = true;
      $scope.checkForNoFee();
    } else if (newVal < $scope.totalBalance) {
      $scope.checkForNoFee();
      this.error['moreThanInWallet'] = false;
    } else if (!newVal) {
      $scope.checkForNoFee();
      this.error['moreThanInWallet'] = false;
    }
  });

  $scope.getMinLimits = (quote) => {
    buySell.getMinLimits(quote).then($scope.limits = buySell.limits);
  };

  $scope.getInitialExchangeRate();
}
