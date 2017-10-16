
angular
  .module('walletApp')
  .component('exchangeCheckout', {
    bindings: {
      fiat: '<',
      type: '<',
      quote: '<',
      limits: '<',
      userId: '<',
      trading: '<',
      provider: '<',
      buyLevel: '<',
      buyEnabled: '<',
      buyAccount: '<',
      conversion: '<',
      fiatOptions: '<',
      frequencies: '<',
      collapseSummary: '<',
      onSuccess: '&',
      fiatChange: '&',
      handleQuote: '&',
      handleTrade: '&'
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

  $scope.fiat = this.fiat;
  $scope.fiatOptions = this.fiatOptions;
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.trading = this.trading;
  $scope.onSuccess = this.onSuccess;
  $scope.provider = this.provider.toUpperCase();
  $scope.displayCurrency = () => this.type === 'Buy' ? $scope.fiat : $scope.bitcoin;

  let state = $scope.state = {
    btc: null,
    fiat: null,
    rate: null,
    baseCurr: $scope.fiat,
    frequency: this.frequencies && this.frequencies[0],
    get quoteCurr () { return this.baseFiat ? $scope.bitcoin : $scope.fiat; },
    get baseFiat () { return this.baseCurr === $scope.fiat; },
    get total () { return this.fiat; }
  };

  // cached quote from checkout first
  let quote = this.quote;
  if (quote) {
    state.baseCurr = quote.baseCurrency === 'BTC' ? $scope.bitcoin : $scope.fiat;
    state.fiat = state.baseFiat ? $scope.toSatoshi(quote.baseAmount, $scope.fiat) / this.conversion : null;
    state.btc = !state.baseFiat ? quote.baseAmount : null;
  }

  $scope.resetFields = () => {
    state.fiat = state.btc = null;
    state.baseCurr = $scope.fiat;
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

  $scope.getRate = () => {
    let args = { amount: 1e8, baseCurr: $scope.bitcoin.code, quoteCurr: $scope.fiat.code };
    let quoteP = $q.resolve(this.handleQuote(args));
    quoteP.then(quote => { $scope.state.rate = Math.abs(quote.quoteAmount); });
  };

  $scope.refreshIfValid = (field) => {
    if (state[field] && $scope.checkoutForm[field].$valid) {
      $scope.quote = null;
      $scope.refreshQuote();
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.setMax = () => {
    let { displayCurrency, bitcoin } = $scope;
    let field = displayCurrency() === bitcoin ? 'btc' : 'fiat';

    state[field] = this.limits().max;
    state.baseCurr = displayCurrency();
    $timeout(() => $scope.refreshIfValid(field), 10);
  };

  $scope.enableBuy = () => {
    let obj = {
      'BTC Order': $scope.format($scope.fromSatoshi(state.btc || 0, $scope.bitcoin), $scope.bitcoin, true),
      'Payment Method': typeof this.buyAccount === 'object' ? this.buyAccount.accountType + ' (' + this.buyAccount.accountNumber + ')' : null,
      'TOTAL_COST': $scope.format($scope.fromSatoshi(state.total || 0, $scope.fiat), $scope.fiat, true)
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
    let frequency = state.frequencyCheck && state.frequency;

    if (this.buyAccount || this.buyEnabled) {
      this.handleTrade({account: this.buyAccount, quote: quote})
        .then(trade => {
          this.onSuccess({trade});
        })
        .catch((err) => {
          $scope.state.loadFailed = true;
          $scope.state.error = Exchange.interpretError(err);
        })
        .finally($scope.resetFields).finally($scope.free);
    } else {
      this.onSuccess({quote, frequency});
      $q.resolve().then($scope.resetFields).finally($scope.free);
    }
  };

  $scope.$watch(() => {
    if (!state.rate) return;
    if (!this.limits()) return;

    $scope.$$postDigest(() => {
      let rate = state.rate;
      let limits = this.limits();
      let baseFiat = !currency.isBitCurrency($scope.displayCurrency());
      $scope.min = { fiat: baseFiat ? limits.min : limits.min * rate, btc: baseFiat ? limits.min / rate : limits.min };
      $scope.max = { fiat: baseFiat ? limits.max : limits.max * rate, btc: baseFiat ? limits.max / rate : limits.max };
    });
  });
  $scope.$watch('state.btc', () => !state.baseFiat && $scope.refreshIfValid('btc'));
  $scope.$watch('state.fiat', () => state.baseFiat && $scope.refreshIfValid('fiat'));
  $scope.$watch('$ctrl.fiat', () => { $scope.fiat = this.fiat; $scope.resetFields(); $scope.getRate(); });

  Env.then(env => $scope.qaDebugger = env.qaDebugger);
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
}
