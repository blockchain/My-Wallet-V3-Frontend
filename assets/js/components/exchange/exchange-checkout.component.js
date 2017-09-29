
angular
  .module('walletApp')
  .component('exchangeCheckout', {
    bindings: {
      type: '<',
      quote: '<',
      limits: '<',
      userId: '<',
      dollars: '<',
      trading: '<',
      provider: '<',
      buyLevel: '<',
      buyEnabled: '<',
      buyAccount: '<',
      conversion: '<',
      collapseSummary: '<',
      buyError: '&',
      handleBuy: '&',
      buySuccess: '&',
      handleQuote: '&',
      handleMediums: '&'
    },
    templateUrl: 'templates/exchange/checkout.pug',
    controller: ExchangeCheckoutController,
    controllerAs: '$ctrl'
  });

function ExchangeCheckoutController (Env, AngularHelper, $scope, $rootScope, $timeout, $q, currency, Wallet, MyWalletHelpers, modals, $uibModal, formatTrade, Exchange) {
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.format = currency.formatCurrencyForView;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.btcAccount = Wallet.getDefaultAccount();
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.trading = this.trading;
  $scope.dollars = this.dollars;
  $scope.siftScienceEnabled = false;
  $scope.buySuccess = this.buySuccess;
  $scope.provider = this.provider.toUpperCase();
  $scope.baseConstant = $scope.displayCurrency = this.type === 'Buy' ? $scope.dollars : $scope.bitcoin;

  let state = $scope.state = {
    btc: null,
    fiat: null,
    rate: null,
    baseCurr: $scope.dollars,
    get quoteCurr () { return this.baseFiat ? $scope.bitcoin : $scope.dollars; },
    get baseFiat () { return this.baseCurr === $scope.dollars; },
    get total () { return this.fiat; }
  };

  // cached quote from checkout first
  let quote = this.quote;
  if (quote) {
    state.baseCurr = quote.baseCurrency === 'BTC' ? $scope.bitcoin : $scope.dollars;
    state.fiat = state.baseFiat ? $scope.toSatoshi(quote.baseAmount, $scope.dollars) / this.conversion : null;
    state.btc = !state.baseFiat ? quote.baseAmount : null;
  }

  $scope.resetFields = () => {
    state.fiat = state.btc = null;
    state.baseCurr = $scope.dollars;
  };

  $scope.getQuoteArgs = (state) => ({
    amount: state.baseFiat ? state.fiat * this.conversion | 0 : state.btc * 1e8,
    baseCurr: state.baseCurr.code,
    quoteCurr: state.quoteCurr.code
  });

  $scope.cancelRefresh = () => {
    $scope.refreshQuote.cancel();
    $timeout.cancel($scope.refreshTimeout);
  };

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.cancelRefresh();

    let fetchSuccess = (quote) => {
      $scope.quote = quote;
      state.error = null;
      state.loadFailed = false;
      $scope.refreshTimeout = $timeout($scope.refreshQuote, quote.timeToExpiration);
      if (state.baseFiat) {
        state.btc = Math.abs($scope.fromSatoshi(quote.quoteAmount, $scope.bitcoin));
        state.rate = (1 / (Math.abs(quote.quoteAmount) / 1e8)) * Math.abs(quote.baseAmount);
      } else {
        state.fiat = Math.abs(quote.quoteAmount);
        state.rate = (1 / (Math.abs(quote.baseAmount) / 1e8)) * Math.abs(quote.quoteAmount);
      }
    };

    this.handleQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; });
  }, 500, () => {
    $scope.quote = null;
  });

  $scope.getInitialQuote = () => {
    let args = { amount: 1e8, baseCurr: $scope.bitcoin.code, quoteCurr: $scope.dollars.code };
    let quoteP = $q.resolve(this.handleQuote(args));
    quoteP.then(quote => { $scope.state.rate = Math.abs(quote.quoteAmount); this.handleMediums({quote: quote}); });
  };

  $scope.refreshIfValid = (field) => {
    if (state[field] && $scope.checkoutForm[field].$valid) {
      $scope.quote = null;
      $scope.refreshQuote();
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.enableBuy = () => {
    let obj = {
      'BTC Order': $scope.format($scope.fromSatoshi(state.btc || 0, $scope.bitcoin), $scope.bitcoin, true),
      'Payment Method': typeof this.buyAccount === 'object' ? this.buyAccount.accountType + ' (' + this.buyAccount.accountNumber + ')' : null,
      'TOTAL_COST': $scope.format($scope.fromSatoshi(state.total || 0, $scope.dollars), $scope.dollars, true)
    };

    $uibModal.open({
      controller: function ($scope) { $scope.formattedTrade = formatTrade.confirm(obj); },
      templateUrl: 'partials/confirm-trade-modal.pug',
      windowClass: 'bc-modal trade-summary'
    }).result.then($scope.buy);
  };

  $scope.buy = () => {
    $scope.lock();
    let quote = $scope.quote;
    if (this.buyAccount || this.buyEnabled) {
      this.handleBuy({account: this.buyAccount, quote: quote})
        .then(trade => {
          this.buySuccess({trade});
        })
        .catch((err) => {
          $scope.state.loadFailed = true;
          $scope.state.error = Exchange.interpretError(err);
        })
        .finally($scope.resetFields).finally($scope.free);
    } else {
      this.buySuccess({quote});
      $q.resolve().then($scope.resetFields).finally($scope.free);
    }
  };

  $scope.$watch('state.rate', (rate) => {
    if (!rate) return;
    if (!this.limits()) return;

    let limits = this.limits();
    let baseFiat = !currency.isBitCurrency($scope.baseConstant);
    $scope.min = { fiat: baseFiat ? limits.min : limits.min * rate, btc: baseFiat ? limits.min / rate : limits.min };
    $scope.max = { fiat: baseFiat ? limits.max : limits.max * rate, btc: baseFiat ? limits.max / rate : limits.max };
  });
  $scope.$watch('state.fiat', () => state.baseFiat && $scope.refreshIfValid('fiat'));
  $scope.$watch('state.btc', () => !state.baseFiat && $scope.refreshIfValid('btc'));

  Env.then(env => $scope.qaDebugger = env.qaDebugger);
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
  $scope.getInitialQuote();
}
