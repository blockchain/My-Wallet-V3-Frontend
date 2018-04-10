
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
      showRecurring: '<',
      disableRecurring: '<',
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

function ExchangeCheckoutController (Env, AngularHelper, $scope, $rootScope, $timeout, $q, currency, Wallet, MyWalletHelpers, modals, $uibModal, formatTrade, recurringTrade, Exchange, MyWallet) {
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
    amount: state.baseFiat ? state.fiat * this.conversion | 0 : state.btc * 1e8 | 0,
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
      Wallet.api.incrementPartnerQuote($scope.provider, this.type, quote.baseCurrency, quote.quoteCurrency);
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
    let { bitcoin, fiat } = $scope;
    let curr = this.fiatLimits ? fiat : bitcoin;
    let field = this.fiatLimits ? 'fiat' : 'btc';

    state.baseCurr = curr;
    state[field] = $scope.max[field];
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
        .then($scope.resetFields).then(() => $timeout(() => $scope.busy = false, 300));
    }
  };

  $scope.$watch(() => {
    if (!state.rate) return;
    if (!this.limits()) return;

    $scope.$$postDigest(() => {
      let rate = state.rate;
      let limits = this.limits(rate);
      let baseFiat = this.fiatLimits;
      let format = (amt, dec) => parseFloat(amt.toFixed(dec));
      $scope.min = { fiat: baseFiat ? limits.min : format(limits.min * rate, 2), btc: baseFiat ? format(limits.min / rate, 8) : limits.min };
      $scope.max = { fiat: baseFiat ? limits.max : format(limits.max * rate, 2), btc: baseFiat ? format(limits.max / rate, 8) : limits.max };
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
    this.showRecurringBuy = this.showRecurring;
  });
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);

  $scope.$watch('max', (n, o) => { !n ? $scope.lock() : $scope.free(); });
}
