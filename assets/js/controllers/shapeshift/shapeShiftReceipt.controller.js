angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope, ShapeShift) {
  $scope.vm.trade = ShapeShift.shapeshift.trades[0];
}
