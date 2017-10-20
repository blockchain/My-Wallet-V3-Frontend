angular
  .module('walletApp')
  .component('shiftCreate', {
    bindings: {
      fees: '<',
      asset: '<',
      wallet: '<',
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

  this.origins = this.wallet ? [this.wallet] : Wallet.accounts().concat(Ethereum.defaultAccount);
  this.destinations = this.wallet ? [Wallet.accounts(), Ethereum.defaultAccount] : [this.to];

  $scope.toEther = currency.convertToEther;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.toBitcoinCash = currency.convertToBitcoinCash;
  $scope.fromBitcoinCash = currency.convertFromBitcoinCash;
  $scope.country = MyWallet.wallet.accountInfo.countryCodeGuess;
  $scope.fiat = $scope.country === 'US'
    ? currency.currencies.filter(c => c.code === 'USD')[0]
    : currency.currencies.filter(c => c.code === 'EUR')[0];
  $scope.ether = currency.ethCurrencies.filter(c => c.code === 'ETH')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.bitcoinCash = currency.bchCurrencies.filter(c => c.code === 'BCH')[0];
  $scope.dollars = Wallet.settings.currency;
  $scope.forms = $scope.state = {};

  $scope.bitCurrencyMap = {
    'eth': { currency: $scope.ether, format: $scope.toEther },
    'btc': { currency: $scope.bitcoin, format: $scope.toSatoshi },
    'bch': { currency: $scope.bitcoinCash, format: $scope.toBitcoinCash }
  };

  buyStatus.canBuy().then((res) => $scope.canBuy = res);

  let state = $scope.state = {
    baseCurr: this.asset || 'btc',
    rate: { min: null, max: null },
    input: { amount: null, curr: this.asset || 'btc' },
    output: { amount: null, curr: this.asset ? 'btc' : 'eth' },
    get baseInput () { return this.baseCurr === state.input.curr; },
    get baseBTC () { return this.baseCurr === 'btc'; },
    get baseBCH () { return this.baseCurr === 'bch'; }
  };

  $scope.getQuoteArgs = (state) => ({
    pair: state.input.curr + '_' + state.output.curr,
    amount: state.baseInput ? $scope.forms.shiftForm.input.$viewValue : -$scope.forms.shiftForm.output.$viewValue
  });

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.lock();
    let fetchSuccess = (quote) => {
      let input = $scope.bitCurrencyMap[state.input.curr];
      let output = $scope.bitCurrencyMap[state.output.curr];
      $scope.quote = quote; state.error = null; state.loadFailed = false;
      if (state.baseInput) state.output.amount = output.format(Number.parseFloat(quote.withdrawalAmount), output.currency);
      else state.input.amount = input.format(Number.parseFloat(quote.depositAmount), input.currency);
      AngularHelper.$safeApply();
    };

    this.handleApproximateQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; })
      .then($scope.free);
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
      payment.getFee().then((fee) => this.onComplete({payment: payment, fee: fee, quote: quote}));
    }).then($scope.free);
  };

  let getRate = () => {
    let input = $scope.bitCurrencyMap[state.input.curr];
    let upperLimit = input.format(UPPER_LIMIT, $scope.fiat);

    return $q.resolve(this.handleRate({rate: state.input.curr + '_' + state.output.curr}))
    .then((rate) => {
      let maxLimit = input.format(rate.maxLimit, input.currency);
      state.rate.min = input.format(rate.minimum, input.currency);
      state.rate.max = maxLimit < upperLimit ? maxLimit : upperLimit;
    });
  };

  $scope.setTo = () => {
    if (this.from.wei) $scope.setFromEth();
    else if (this.from.keyRing) $scope.setFromBtc();
  };

  $scope.setFromEth = () => {
    this.destinations = Wallet.accounts();
    this.to = this.to.keyRing ? this.to : Wallet.getDefaultAccount();
    state.input.curr = state.baseCurr = 'eth';
    state.output.curr = 'btc';
    state.input.amount = state.output.amount = null;
    getRate().then(() => $scope.getAvailableBalance());
  };

  $scope.setFromBtc = () => {
    this.destinations = Ethereum.defaultAccount;
    this.to = Ethereum.defaultAccount;
    state.input.curr = state.baseCurr = 'btc';
    state.output.curr = 'eth';
    state.input.amount = state.output.amount = null;
    getRate().then(() => $scope.getAvailableBalance());
  };

  $scope.getAvailableBalance = () => {
    let fetchSuccess = (balance, fee) => {
      $scope.maxAvailable = balance.amount;
      $scope.cachedFee = balance.fee;

      state.error = null;
      state.balanceFailed = false;
      if (this.wallet) {
        state.input.amount = Math.min(state.rate.max, $scope.maxAvailable);
      }
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

    let fee = state.baseBTC || state.baseBCH ? this.fees[state.baseCurr] : '';
    return $q.resolve(this.from.getAvailableBalance(fee)).then(fetchSuccess, fetchError);
  };
  $scope.switched = false;
  $scope.switch = () => {
    $scope.switched = !$scope.switched;
    [$scope.state.input, $scope.state.output] = [$scope.state.output, $scope.state.input];
    [this.from, this.to] = [this.to, this.from];
    $scope.state.input.curr === 'eth' ? state.baseCurr = 'eth' : state.baseCurr = 'btc';
    state.input.amount = state.output.amount = null;
    getRate().then(() => $scope.getAvailableBalance());
  };

  $scope.setMin = () => state.input.amount = state.rate.min;
  $scope.setMax = () => state.input.amount = $scope.maxAvailable < state.rate.max ? $scope.maxAvailable : state.rate.max;

  $scope.$watch('$ctrl.from.balance', (n, o) => n !== o && $scope.getAvailableBalance());
  $scope.$watch('state.output.curr', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));

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
}
