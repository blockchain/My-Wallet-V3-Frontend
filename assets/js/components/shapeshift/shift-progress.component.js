angular
  .module('walletApp')
  .component('shiftProgress', {
    bindings: {
      shift: '<'
    },
    templateUrl: 'templates/shapeshift/progress.pug',
    controller: ShiftProgressController,
    controllerAs: '$ctrl'
  });

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function ShiftProgressController ($scope) {
  $scope.trade = this.shift;

  this.steps = enumify('no_deposits', 'received', 'complete', 'failed', 'resolved');
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  $scope.$watch('trade.status', (status) => this.goTo(status));
}
