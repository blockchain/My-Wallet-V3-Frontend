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

function ShiftProgressController ($scope) {
  $scope.trade = this.shift;
}
