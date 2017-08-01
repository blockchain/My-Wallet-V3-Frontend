angular
  .module('walletApp')
  .component('shiftCheckoutAmount', {
    bindings: {
      quote: '<',
      limits: '<',
      inputCurr: '<',
      outputCurr: '<',
      handleQuote: '&',
      handleExchange: '&',
      exchangeSuccess: '&',
      exchangeError: '&'
    },
    templateUrl: 'templates/shift/checkout-amount.pug',
    controller: ShiftCheckoutAmountController,
    controllerAs: '$ctrl'
  });

function ShiftCheckoutAmountController (Env, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, smartAccount) {
  $scope.format = currency.formatCurrencyForView;
  $scope.input = this.inputCurr;
  $scope.output = this.outputCurr;
  $scope.from = Wallet.getDefaultAccount();
  $scope.origins = smartAccount.getOptions();
  $scope.to = Ethereum.defaultAccount;

  let state = $scope.state = {
    input: null,
    output: null,
    rate: null,
    baseCurr: $scope.inputCurr,
    get quoteCurr () { return this.baseInput ? $scope.outputCurr : $scope.inputCurr; },
    get baseInput () { return this.baseCurr === $scope.inputCurr; },
    get total () { return this.fiat; }
  };

  $scope.resetFields = () => {
    state.input = state.output = null;
    state.baseCurr = $scope.input;
  };

  $scope.getQuoteArgs = (state) => ({
    pair: state.baseInput ? state.inputCurr + '_' + state.outputCurr : state.outputCurr + '_' + state.inputCurr,
    amount: state.input,
    withdrawl: state.withdrawl
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
      if (state.baseInput) state.btc = quote.quoteAmount;
      else state.input = $scope.toSatoshi(quote.quoteAmount, $scope.input) / this.conversion;
    };

    this.handleQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; });
  }, 500, () => {
    $scope.quote = null;
  });

  $scope.refreshIfValid = (field) => {
    if (state[field]) {
      $scope.quote = null;
      $scope.refreshQuote();
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.exchange = () => {
    $scope.lock();
    let quote = $scope.quote;
    this.handleExchange({quote: quote})
      .then(trade => {
        this.exchangeSuccess({trade});
      })
      .catch((err) => {
        $scope.state.loadFailed = true;
        $scope.state.error = Exchange.interpretError(err);
      }).finally($scope.resetFields).finally($scope.free);
  };

  $scope.$watch('state.input', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output', () => !state.baseInput && $scope.refreshIfValid('output'));
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
}
