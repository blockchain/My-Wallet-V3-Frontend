
angular
  .module('walletApp')
  .component('exchangeCheckout', {
    bindings: {
      fiat: '<',
      type: '<',
      quote: '<',
      limits: '<',
      trading: '<',
      provider: '<',
      buyLevel: '<',
      fiatLimits: '<',
      tradeEnabled: '<',
      tradeAccount: '<',
      conversion: '<',
      fiatOptions: '<',
      frequencies: '<',
      collapseSummary: '<',
      recurringBuyLimit: '&',
      onSuccess: '&',
      fiatChange: '&',
      handleQuote: '&',
      handleTrade: '&'
    },
    templateUrl: 'templates/exchange/checkout.pug',
    controller: ExchangeCheckoutController,
    controllerAs: '$ctrl'
  });

function ExchangeCheckoutController (Env, AngularHelper, $scope, $rootScope, $timeout, $q, currency, Wallet, MyWalletHelpers, modals, $uibModal, formatTrade, recurringTrade, Exchange) {
  $scope.date = new Date();
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.format = currency.formatCurrencyForView;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.btcAccount = Wallet.getDefaultAccount();

  $scope.fiat = this.fiat;
  $scope.trading = this.trading;
  $scope.onSuccess = this.onSuccess;
  $scope.fiatOptions = this.fiatOptions;
  $scope.provider = this.provider.toUpperCase();
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.recurringTimespan = () => recurringTrade.getTimespan($scope.date, state.frequency || this.frequencies[0]);

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
    state.frequency = this.frequencies && this.frequencies[0] || null;
    state.endTime = null;
    state.frequencyCheck = false;
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
        state.rate = +((1 / (Math.abs(quote.quoteAmount) / 1e8)) * Math.abs(quote.baseAmount)).toFixed(2);
      } else {
        state.fiat = Math.abs(quote.quoteAmount);
        state.rate = +((1 / (Math.abs(quote.baseAmount) / 1e8)) * Math.abs(quote.quoteAmount)).toFixed(2);
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
    quoteP.then(quote => { $scope.state.rate = +Math.abs(quote.quoteAmount).toFixed(2); });
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
    let { fiat, bitcoin } = $scope;
    let curr = this.fiatLimits ? fiat : bitcoin;
    let field = this.fiatLimits ? 'fiat' : 'btc';

    state.baseCurr = curr;
    state[field] = this.limits(state.rate).max;
    $timeout(() => $scope.refreshIfValid(field), 10);
  };

  $scope.trade = () => {
    $scope.busy = true;
    let quote = $scope.quote;
    let endTime = state.endTime;
    let frequency = state.frequencyCheck && state.frequency;
    let verificationRequired = this.trading().verificationRequired;

    if (this.tradeEnabled && !verificationRequired) {
      this.handleTrade({quote: quote})
        .then(trade => {
          this.onSuccess({trade});
        })
        .catch((err) => {
          $scope.state.loadFailed = true;
          $scope.state.error = Exchange.interpretError(err);
        })
        .finally($scope.resetFields).finally(() => $scope.busy = false);
    } else {
      $q.resolve(this.onSuccess({quote, frequency, endTime}))
        .then($scope.resetFields).finally($scope.free);
    }
  };

  $scope.$watch(() => {
    if (!state.rate) return;
    if (!this.limits()) return;

    $scope.$$postDigest(() => {
      let rate = state.rate;
      let limits = this.limits(rate);
      let baseFiat = this.fiatLimits;
      $scope.min = { fiat: baseFiat ? limits.min : limits.min * rate, btc: baseFiat ? limits.min / rate : limits.min };
      $scope.max = { fiat: baseFiat ? limits.max : limits.max * rate, btc: baseFiat ? limits.max / rate : limits.max };
    });
  });
  $scope.$watch('state.btc', () => !state.baseFiat && $scope.refreshIfValid('btc'));
  $scope.$watch('state.fiat', () => state.baseFiat && $scope.refreshIfValid('fiat'));
  $scope.$watch('$ctrl.fiat', () => { $scope.fiat = this.fiat; $scope.resetFields(); $scope.getRate(); });
  $scope.$watch('checkoutForm.fiat.$viewValue', (val) => { if (parseFloat(val) > this.recurringBuyLimit()) state.frequencyCheck = false; });
  $scope.$watch('state.frequency', (n) => $scope.minDate = recurringTrade.setDate(n));
  $scope.dateFormat = 'd MMMM yyyy';

  Env.then(env => {
    $scope.qaDebugger = env.qaDebugger;
    this.showRecurringBuy = env.partners.coinify.showRecurringBuy;
  });
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);

  $scope.$watch('max', (n, o) => { !n ? $scope.lock() : $scope.free(); });
}
