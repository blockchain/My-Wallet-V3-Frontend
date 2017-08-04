angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope, ShapeShift, trade = null, $uibModalStack) {
  $scope.vm.trade = trade || ShapeShift.shapeshift.trades[0];

  $scope.vm.close = () => $uibModalStack.dismissAll();
  $scope.vm.negativeState = () => $scope.vm.trade.isFailed;
}
