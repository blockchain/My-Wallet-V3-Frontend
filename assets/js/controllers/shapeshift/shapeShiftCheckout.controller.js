angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

function ShapeShiftCheckoutController ($scope, $stateParams, ShapeShift, modals, AngularHelper, MyWallet, state, Env) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  this.human = {'BTC': 'bitcoin', 'ETH': 'ether'};
  this.steps = enumify('state-select', 'create', 'confirm', 'receipt');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);
  this.completedTrades = () => this.trades.some(t => t.isComplete || t.isFailed || t.isResolved);
  this.pendingTrades = () => this.trades.some(t => t.isProcessing || t.isWaitingForDeposit);

  let accountInfo = MyWallet.wallet.accountInfo;
  let codeGuess = accountInfo && accountInfo.countryCodeGuess;
  let storedState = ShapeShift.USAState;

  if (codeGuess === 'US' && !storedState) {
    this.states = state.stateCodes;
    this.goTo('state-select');
  } else {
    this.goTo('create');
  }
}
