angular
  .module('walletApp')
  .component('shiftReceipt', {
    bindings: {
      shift: '<'
    },
    templateUrl: 'templates/shapeshift/receipt.pug',
    controller: ShiftReceiptController,
    controllerAs: '$ctrl'
  });

function ShiftReceiptController ($scope) {
  $scope.trade = this.shift;
  $scope.human = {'BTC': 'bitcoin', 'ETH': 'ether'};

  $scope.input = this.shift.pair.split('_')[0].toUpperCase();
  $scope.output = this.shift.pair.split('_')[1].toUpperCase();
}
