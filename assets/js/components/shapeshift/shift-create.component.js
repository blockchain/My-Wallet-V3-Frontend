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

function ShiftCreateController (Env, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, ShapeShift, buyStatus) {
  this.to = Ethereum.defaultAccount;
  this.from = Wallet.getDefaultAccount();
  this.origins = [this.from, this.to];
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

  $scope.cancelRefresh = () => {
    $scope.refreshQuote.cancel();
    $timeout.cancel($scope.refreshTimeout);
  };

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.cancelRefresh();

    let fetchSuccess = (quote) => {
      let now = new Date();
      $scope.quote = quote;
      state.error = null;
      state.loadFailed = false;
      $scope.refreshTimeout = $timeout($scope.refreshQuote, quote.expires - now);
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
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.getSendAmount = () => {
    $scope.lock();
    this.handleQuote($scope.getQuoteArgs(state)).then((quote) => {
      let payment = this.buildPayment({quote});
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
    $q.resolve(this.handleRate({rate: state.input.curr + '_' + state.output.curr}))
      .then((rate) => { state.rate.min = rate.minimum; state.rate.max = rate.maxLimit; });
  };

  let getAvailableBalance = () => {
    let fetchSuccess = (balance) => {
      $scope.maxAvailable = state.baseBTC ? currency.convertFromSatoshi(balance, $scope.bitcoin) : parseFloat(currency.formatCurrencyForView(balance, $scope.ether, false));
      state.balanceFailed = false;
      state.error = null;
    };

    let fetchError = (err) => {
      $scope.maxAvailable = 0;
      state.balanceFailed = true;
      state.error = Exchange.interpretError(err);
    };

    return $q.resolve(this.from.getAvailableBalance(state.baseBTC && 'priority')).then(fetchSuccess, fetchError);
  };

  $scope.$watch('state.input.curr', () => getAvailableBalance().then(getRate));
  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
}
