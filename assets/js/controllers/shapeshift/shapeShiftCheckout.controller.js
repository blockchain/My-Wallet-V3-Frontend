angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function ShapeShiftCheckoutController ($scope, $stateParams, ShapeShift, modals) {
  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  this.trades = [];
  this.pendingTrades = [];

  $scope.$watch(
    () => ShapeShift.shapeshift.trades,
    (trades) => {
      this.pendingTrades = trades.filter(t => t.isProcessing || t.isWaitingForDeposit);
      this.trades = trades.filter(t => t.isComplete || t.isFailed);
    }
  );

  this.human = {'BTC': 'bitcoin', 'ETH': 'ether'};
  this.steps = enumify('create', 'confirm', 'receipt');
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.openTradeDetails = trade => modals.openShiftTradeDetails(trade);
  this.goTo('receipt');
}
