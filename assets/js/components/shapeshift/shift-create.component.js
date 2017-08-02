angular
  .module('walletApp')
  .component('shiftCreate', {
    bindings: {
      fiat: '<',
      quote: '<',
      handleQuote: '&',
      handleNext: '&'
    },
    templateUrl: 'templates/shapeshift/create.pug',
    controller: ShiftCreateController,
    controllerAs: '$ctrl'
  });

function ShiftCreateController (Env, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, smartAccount) {
  this.to = Ethereum.defaultAccount;
  this.from = Wallet.getDefaultAccount();
  this.origins = [this.from, this.to];
  $scope.format = currency.formatCurrencyForView;
  $scope.forms = $scope.state = {};

  let state = $scope.state = {
    baseCurr: null,
    input: { amount: null, curr: 'btc' },
    output: { amount: null, curr: 'eth' },
    get quoteCurr () { return this.baseInput ? state.output.curr : state.input.curr; },
    get baseInput () { return this.baseCurr === state.input.curr; },
    get total () { return this.fiat; }
  };

  $scope.resetFields = () => {
    state.input.amount = state.output.amount = null;
    state.baseCurr = state.input.curr;
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
    };

    this.handleQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; });
  }, 500, () => {
    $scope.quote = null;
  });

  $scope.refreshIfValid = (field) => {
    if ($scope.state[field].amount) {
      $scope.quote = null;
      $scope.refreshQuote();
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.next = () => {
    let quote = $scope.quote;
    quote && $scope.handleNext({quote});
  };

  $scope.setTo = () => {
    let output = state.output;
    state.baseCurr = state.output.curr;
    state.output = state.input; state.input = output;
    this.to = this.origins.find((o) => o.label !== this.from.label);
  };

  $scope.$watch('state.input.amount', () => state.baseInput && $scope.refreshIfValid('input'));
  $scope.$watch('state.output.amount', () => !state.baseInput && $scope.refreshIfValid('output'));
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
}
