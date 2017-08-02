angular
  .module('walletApp')
  .controller('ShapeShiftConfirmController', ShapeShiftConfirmController);

function ShapeShiftConfirmController ($scope, ShapeShift) {
  $scope.shiftHandler = ShapeShift.shift;
  $scope.shiftSuccess = (trade) => { debugger; };

  $scope.onComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.vm.goTo('confirm');
  };
}
