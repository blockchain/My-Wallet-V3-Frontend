angular
  .module('walletApp')
  .controller('ShapeShiftConfirmController', ShapeShiftConfirmController);

function ShapeShiftConfirmController ($scope, ShapeShift) {
  $scope.shiftHandler = ShapeShift.shift;

  $scope.onComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.vm.goTo('receipt');
  };

  $scope.onCancel = () => {
    $scope.vm.goTo('create');
  };
}
