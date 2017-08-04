angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope) {
  $scope.trade = $scope.vm.trade;
}
