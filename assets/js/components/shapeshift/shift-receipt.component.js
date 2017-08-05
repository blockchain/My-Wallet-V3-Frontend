angular
  .module('walletApp')
  .component('shiftReceipt', {
    bindings: {
      shift: '<',
      isCheckout: '<',
      onClose: '&'
    },
    templateUrl: 'templates/shapeshift/receipt.pug',
    controller: ShiftReceiptController,
    controllerAs: '$ctrl'
  });

function ShiftReceiptController ($scope, $q, ShapeShift) {
  $scope.trade = this.shift;
  $scope.isCheckout = this.isCheckout;
  $scope.human = {'btc': 'bitcoin', 'eth': 'ether'};

  $scope.input = this.shift.pair.split('_')[0];
  $scope.output = this.shift.pair.split('_')[1];

  ShapeShift.watchTradeForCompletion($scope.trade);
}
