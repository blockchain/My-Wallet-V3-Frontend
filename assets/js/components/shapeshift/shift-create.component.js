angular
  .module('walletApp')
  .component('shiftCreate', {
    bindings: {
      fees: '<',
      asset: '<',
      wallet: '<',
      wallets: '<',
      destination: '<',
      onComplete: '&',
      handleRate: '&',
      handleQuote: '&',
      buildPayment: '&',
      handleApproximateQuote: '&'
    },
    templateUrl: 'templates/shapeshift/create.pug',
    controller: ShiftCreateController,
    controllerAs: '$ctrl'
  });

function ShiftCreateController (Env, AngularHelper, $translate, $scope, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, ShapeShift, tradeStatus, MyWallet) {
  let UPPER_LIMIT;
  let nAssets = Object.keys(currency.cryptoCurrencyMap).length;
  Env.then(env => {
    UPPER_LIMIT = env.shapeshift.upperLimit || 500;
    getRate().then(() => $scope.getAvailableBalance());
  });

  this.from = this.wallet || Wallet.getDefaultAccount();

  this.to = null;
  if (this.destination) this.to = this.wallets.filter(w => w.coinCode === this.destination)[0];
  else if (this.wallet) this.to = Wallet.getDefaultAccount();
  else this.to = Ethereum.defaultAccount;

  this.origins = this.wallet ? [this.wallet] : this.wallets;
  this.destinations = this.wallets;

  this.isGrouped = nAssets !== this.wallets.length;
  this.coinGroup = (c) => currency.cryptoCurrencyMap[c.coinCode].human;

  $scope.forms = $scope.state = {};
  $scope.dollars = Wallet.settings.currency;
  $scope.symbol = currency.conversions[$scope.dollars.code].symbol;
  $scope.country = MyWallet.wallet.accountInfo.countryCodeGuess;
  $scope.cryptoCurrencyMap = currency.cryptoCurrencyMap;
  $scope.fiat = $scope.country === 'US'
    ? currency.currencies.filter(c => c.code === 'USD')[0]
    : currency.currencies.filter(c => c.code === 'EUR')[0];

  let state = $scope.state = {
    input: { amount: null },
    output: { amount: null },
    rate: { min: null, max: null },
    baseCurr: $scope.$ctrl.from.coinCode,
    get baseInput () { return this.baseCurr === $scope.$ctrl.from.coinCode; }
  };

  $scope.getQuoteArgs = (state) => ({
    to: this.to,
    from: this.from,
    amount: state.baseInput ? $scope.forms.shiftForm.input.$viewValue : -$scope.forms.shiftForm.output.$viewValue
  });

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.lock();
    let fetchSuccess = (quote) => {
      let input = $scope.cryptoCurrencyMap[this.from.coinCode];
      let output = $scope.cryptoCurrencyMap[this.to.coinCode];

      $scope.free();
      $scope.quote = quote; state.error = null; state.loadFailed = false;
      if (state.baseInput) state.output.amount = output.to(Number.parseFloat(quote.withdrawalAmount), output.currency);
      else state.input.amount = input.to(Number.parseFloat(quote.depositAmount), input.currency);
      AngularHelper.$safeApply();
    };

    let fetchError = () => {
      state.loadFailed = true;
      $scope.free();
    };

    this.handleApproximateQuote($scope.getQuoteArgs(state)).then(fetchSuccess, fetchError);
  }, 500, () => {
    $scope.quote = null;
  });

  $scope.refreshIfValid = (field) => {
    if ($scope.state[field].amount) {
      $scope.quote = null;
      state.loadFailed = false;
      $scope.refreshQuote();
    }
  };

  $scope.getSendAmount = () => {
    $scope.busy = true;
    state.baseCurr = this.from.coinCode;
    this.handleQuote($scope.getQuoteArgs(state)).then((quote) => {
      let payment = this.buildPayment({quote: quote, fee: $scope.cachedFee, from: this.from});
      payment.getFee().then((fee) => { $scope.busy = false; this.onComplete({payment: payment, fee: fee, quote: quote, destination: this.to}); });
    }).catch((err) => { console.log(err); $scope.busy = false; });
  };

  let getRate = () => {
    let input = $scope.cryptoCurrencyMap[this.from.coinCode];
    let upperLimit = input.to(UPPER_LIMIT, $scope.fiat);

    return $q.resolve(this.handleRate({rate: this.from.coinCode + '_' + this.to.coinCode}))
              .then((rate) => {
                let maxLimit = input.to(rate.maxLimit, input.currency);
                state.rate.min = input.to(rate.minimum, input.currency);
                state.rate.max = maxLimit < upperLimit ? maxLimit : upperLimit;
              });
  };

  $scope.getAvailableBalance = () => {
    let fetchSuccess = (balance, fee) => {
      state.error = null;
      state.balanceFailed = false;
      $scope.cachedFee = balance.fee;
      $scope.maxAvailable = balance.amount;
      if (this.wallet) state.input.amount = Math.min(state.rate.max, $scope.maxAvailable);
    };

    let fetchError = (err) => {
      $scope.maxAvailable = 0;
      state.balanceFailed = true;
      if (Exchange.interpretError(err) === 'No free outputs to spend') {
        state.error = $translate.instant('.NO_FUNDS_TO_EXCHANGE');
      } else {
        state.error = Exchange.interpretError(err);
      }
    };

    let fee = this.fees[this.from.coinCode];
    return $q.resolve(this.from.getAvailableBalance(fee)).then(fetchSuccess, fetchError);
  };

  $scope.switch = () => {
    state.rate.min = 0;
    [this.from, this.to] = [this.to, this.from];
    state.input.amount = state.output.amount = null;
  };

  $scope.setWallet = (direction, change) => {
    state.rate.min = 0;
    let needsSelection = this.from.coinCode === this.to.coinCode;
    let selections = needsSelection && this.wallets.filter((w) => w.coinCode !== this[direction].coinCode);
    needsSelection && (this[change] = selections[0]);
  };

  $scope.setMin = () => state.input.amount = state.rate.min;
  $scope.setMax = () => state.input.amount = $scope.maxAvailable < state.rate.max ? $scope.maxAvailable : state.rate.max;

  $scope.$watch('$ctrl.to.coinCode', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));
  $scope.$watchGroup(['$ctrl.from.balance', '$ctrl.to.balance'], (n, o) => { if (n !== o) { getRate().then($scope.getAvailableBalance); } });

  // Stat: how often do users see the "max limit" error?
  let sawMaxLimit = false;
  Wallet.api.incrementShapeshiftStat();
  $scope.$watch('forms.shiftForm.input.$error.max && maxAvailable >= state.rate.max', (errorShown) => {
    if (errorShown && !sawMaxLimit) {
      sawMaxLimit = true;
      Wallet.api.incrementShapeshiftStat({ maxLimitError: true });
    }
  });

  AngularHelper.installLock.call($scope);
  tradeStatus.canTrade().then((res) => $scope.canTrade = res);
}
