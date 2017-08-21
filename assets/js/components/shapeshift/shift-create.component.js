angular
  .module('walletApp')
  .component('shiftCreate', {
    bindings: {
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

function ShiftCreateController (Env, AngularHelper, $translate, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, ShapeShift, buyStatus) {
  let UPPER_LIMIT;
  Env.then(env => UPPER_LIMIT = env.shapeshift.upperLimit || 500);

  this.to = Ethereum.defaultAccount;
  this.from = Wallet.getDefaultAccount();
  this.origins = [this.from, this.to];
  $scope.toEther = currency.convertToEther;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.usd = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.ether = currency.ethCurrencies.filter(c => c.code === 'ETH')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.dollars = Wallet.settings.displayCurrency;
  $scope.forms = $scope.state = {};

  buyStatus.canBuy().then((res) => $scope.canBuy = res);

  let state = $scope.state = {
    baseCurr: null,
    rate: { min: null, max: null },
    input: { amount: null, curr: 'btc' },
    output: { amount: null, curr: 'eth' },
    get baseBTC () { return state.input.curr === 'btc'; },
    get baseInput () { return this.baseCurr === state.input.curr; }
  };

  $scope.getQuoteArgs = (state) => ({
    pair: state.baseInput ? state.input.curr + '_' + state.output.curr : state.output.curr + '_' + state.input.curr,
    amount: state.baseInput ? state.input.amount : state.output.amount
  });

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    let fetchSuccess = (quote) => {
      $scope.quote = quote;
      state.error = null;
      state.loadFailed = false;
      if (state.baseInput) state.output.amount = Number.parseFloat(quote.withdrawalAmount);
      else state.input.amount = Number.parseFloat(quote.withdrawalAmount);
      AngularHelper.$safeApply();
    };

    this.handleApproximateQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; });
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
      let payment = this.buildPayment({quote: quote, fee: $scope.cachedFee});
      payment.getFee().then((fee) => this.onComplete({payment: payment, fee: fee, quote: quote}));
    }).then(($scope.free));
  };

  $scope.setTo = () => {
    let output = state.output;
    state.baseCurr = state.output.curr;
    state.output = state.input; state.input = output;
    this.to = this.origins.find((o) => o.label !== this.from.label);
  };

  let getRate = () => {
    let upperLimit = state.baseBTC
                     ? $scope.fromSatoshi($scope.toSatoshi(UPPER_LIMIT, $scope.usd), $scope.bitcoin)
                     : parseFloat(currency.formatCurrencyForView($scope.toEther(UPPER_LIMIT, $scope.usd), $scope.ether, false));

    $q.resolve(this.handleRate({rate: state.input.curr + '_' + state.output.curr}))
      .then((rate) => { state.rate.min = rate.minimum; state.rate.max = rate.maxLimit < upperLimit ? rate.maxLimit : upperLimit; });
  };

  let getAvailableBalance = () => {
    let fetchSuccess = (balance, fee) => {
      $scope.maxAvailable = state.baseBTC ? $scope.fromSatoshi(balance.amount, $scope.bitcoin) : parseFloat(currency.formatCurrencyForView(balance.amount, $scope.ether, false));
      $scope.cachedFee = balance.fee;
      state.balanceFailed = false;
      state.error = null;
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

    return $q.resolve(this.from.getAvailableBalance(state.baseBTC && 'priority')).then(fetchSuccess, fetchError);
  };

  $scope.$watch('state.input.curr', () => getAvailableBalance().then(getRate));
  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));
  AngularHelper.installLock.call($scope);
}
