angular
  .module('walletApp')
  .controller('BitcoinCashExchangeController', BitcoinCashExchangeController);

function BitcoinCashExchangeController ($scope, ShapeShift) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.steps = enumify('exchange-create', 'exchange-confirm', 'exchange-receipt');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.goTo('exchange-create');

  $scope.rateHandler = ShapeShift.getRate;
  $scope.quoteHandler = ShapeShift.getQuote;
  $scope.buildPayment = ShapeShift.buildPayment;
  $scope.approximateQuoteHandler = ShapeShift.getApproximateQuote;

  $scope.onComplete = (payment, fee, quote) => {
    $scope.vm.fee = fee;
    $scope.vm.quote = quote;
    $scope.vm.payment = payment;
    $scope.vm.goTo('confirm');
  };
}
