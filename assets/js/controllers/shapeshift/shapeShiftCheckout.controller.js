angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function ShapeShiftCheckoutController ($scope, $stateParams) {
  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  this.human = {'BTC': 'bitcoin', 'ETH': 'ether'};
  this.steps = enumify('create', 'confirm', 'receipt');
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo('create');
}
