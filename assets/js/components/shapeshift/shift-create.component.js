angular
  .module('walletApp')
  .component('shiftCreate', {
    bindings: {
      fees: '<',
      asset: '<',
      wallet: '<',
      wallets: '<',
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

function ShiftCreateController (Env, AngularHelper, $translate, $scope, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, ShapeShift, buyStatus, MyWallet) {
  let UPPER_LIMIT;
  Env.then(env => {
    UPPER_LIMIT = env.shapeshift.upperLimit || 500;
    getRate().then(() => $scope.getAvailableBalance());
  });

  this.from = this.wallet || Wallet.getDefaultAccount();
  this.to = this.wallet ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;

  this.origins = this.wallet ? [this.wallet] : this.wallets;
  this.destinations = this.wallets;

  $scope.forms = $scope.state = {};
  $scope.dollars = Wallet.settings.currency;
  $scope.country = MyWallet.wallet.accountInfo.countryCodeGuess;
  $scope.fiat = $scope.country === 'US'
    ? currency.currencies.filter(c => c.code === 'USD')[0]
    : currency.currencies.filter(c => c.code === 'EUR')[0];
  $scope.ether = currency.ethCurrencies.filter(c => c.code === 'ETH')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.bitcoinCash = currency.bchCurrencies.filter(c => c.code === 'BCH')[0];

  $scope.bitCurrencyMap = {
    'eth': { currency: $scope.ether, convert: currency.convertToEther },
    'btc': { currency: $scope.bitcoin, convert: currency.convertToSatoshi },
    'bch': { currency: $scope.bitcoinCash, convert: currency.convertToBitcoinCash }
  };

  let state = $scope.state = {
    baseCurr: this.asset || 'btc',
    rate: { min: null, max: null },
    input: { amount: null, curr: this.asset || 'btc' },
    output: { amount: null, curr: this.asset ? 'btc' : 'eth' },
    get baseBTC () { return this.baseCurr === 'btc'; },
    get baseInput () { return this.baseCurr === state.input.curr; }
  };

  $scope.setState = () => {
    state.baseCurr = this.currencyHelper(this.from).name;
    state.input.curr = this.currencyHelper(this.from).name;
    state.output.curr = this.currencyHelper(this.to).name;
  };

  $scope.getQuoteArgs = (state) => ({
    index: this.to.index || 0,
    pair: state.input.curr + '_' + state.output.curr,
    amount: state.baseInput ? $scope.forms.shiftForm.input.$viewValue : -$scope.forms.shiftForm.output.$viewValue
  });

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.lock();
    let fetchSuccess = (quote) => {
      let input = $scope.bitCurrencyMap[state.input.curr];
      let output = $scope.bitCurrencyMap[state.output.curr];

      $scope.free();
      $scope.quote = quote; state.error = null; state.loadFailed = false;
      if (state.baseInput) state.output.amount = output.convert(Number.parseFloat(quote.withdrawalAmount), output.currency);
      else state.input.amount = input.convert(Number.parseFloat(quote.depositAmount), input.currency);
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
    $scope.lock();
    state.baseCurr = state.input.curr;
    this.handleQuote($scope.getQuoteArgs(state)).then((quote) => {
      let payment = this.buildPayment({quote: quote, fee: $scope.cachedFee, from: this.from});
      payment.getFee().then((fee) => this.onComplete({payment: payment, fee: fee, quote: quote, destination: this.to}));
    }).then($scope.free);
  };

  let getRate = () => {
    let input = $scope.bitCurrencyMap[state.input.curr];
    let upperLimit = input.convert(UPPER_LIMIT, $scope.fiat);

    return $q.resolve(this.handleRate({rate: state.input.curr + '_' + state.output.curr}))
              .then((rate) => {
                let maxLimit = input.convert(rate.maxLimit, input.currency);
                state.rate.min = input.convert(rate.minimum, input.currency);
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

    let fee = this.fees[state.baseCurr];
    return $q.resolve(this.from.getAvailableBalance(fee)).then(fetchSuccess, fetchError);
  };

  $scope.switch = (wallet) => {
    let from = this.from;
    let needsSelection = wallet && this.from.constructor.name === wallet.constructor.name;
    let selection = needsSelection && this.wallets.filter((w) => w.constructor.name !== wallet.constructor.name);

    this.from = wallet || this.to;
    this.to = needsSelection ? selection[0] : from;

    state.input.amount = state.output.amount = null;
    $scope.setState();
  };

  $scope.setMin = () => state.input.amount = state.rate.min;
  $scope.setMax = () => state.input.amount = $scope.maxAvailable < state.rate.max ? $scope.maxAvailable : state.rate.max;
  $scope.setWallet = (wallet) => { this.to.constructor.name === this.from.constructor.name && $scope.switch(wallet); $scope.setState(); };

  $scope.$watch('state.output.curr', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));
  $scope.$watch('$ctrl.from.balance', (n, o) => { if (n !== o) { getRate().then($scope.getAvailableBalance); } });

  this.currencyHelper = (obj) => {
    if (obj.wei) {
      return {
        name: 'eth',
        icon: 'icon-ethereum'
      };
    } else if (obj.keyRing) {
      return {
        name: 'btc',
        icon: 'icon-bitcoin'
      };
    } else {
      return {
        name: 'bch',
        icon: 'icon-bitcoin-cash'
      };
    }
  };

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
  buyStatus.canBuy().then((res) => $scope.canBuy = res);
}
