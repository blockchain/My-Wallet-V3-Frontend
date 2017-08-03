angular
  .module('walletApp')
  .controller('ShapeShiftTradeDetailsController', ShapeShiftTradeDetailsController);

function ShapeShiftTradeDetailsController ($scope, ShapeShift, trade, $uibModalInstance) {
  $scope.vm.trade = trade;
  $scope.vm.human = {'btc': 'bitcoin', 'eth': 'ether'};
  console.log('trade details ctrl', $scope);
  $scope.vm.getHeader = () => ShapeShift.translateStatus($scope.vm.trade.status);
  $scope.vm.close = () => $uibModalInstance.dismiss();
  $scope.vm.negativeState = () => $scope.vm.trade.isFailed;
}
