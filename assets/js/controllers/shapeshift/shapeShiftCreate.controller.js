angular
  .module('walletApp')
  .controller('ShapeShiftCreateController', ShapeShiftCreateController);

function ShapeShiftCreateController ($scope, ShapeShift) {
  $scope.quoteHandler = ShapeShift.getQuote;
  $scope.approximateQuoteHandler = ShapeShift.getApproximateQuote;

  $scope.onComplete = (quote, fee) => {
    $scope.vm.fee = fee;
    $scope.vm.quote = quote;
    $scope.vm.goTo('confirm');
  };
}
