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
  $scope.human = {'BTC': 'bitcoin', 'ETH': 'ether'};

  $scope.input = this.shift.pair.split('_')[0];
  $scope.output = this.shift.pair.split('_')[1];
}
