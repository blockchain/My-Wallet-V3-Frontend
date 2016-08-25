angular
  .module('walletApp')
  .controller('BuySummaryCtrl', BuySummaryCtrl);

function BuySummaryCtrl ($scope, $q, $timeout, Wallet, buySell, currency) {
  $scope.exchange = buySell.getExchange();
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;

  $scope.getMaxMin = () => {
    const calculateLimits = (rate) => {
      $scope.limits = buySell.calculateLimits(rate, $scope.method);
    };

    buySell.getRate('EUR', $scope.tempCurrency.code).then(calculateLimits);
  };

  $scope.commitValues = () => {
    $scope.status.waiting = true;
    $scope.transaction.currency = $scope.tempCurrency;
    $scope.transaction.fiat = $scope.tempFiat;
    $scope.getQuote().then(() => $scope.status.waiting = false);
    $scope.toggleEditAmount();
  };

  $scope.cancel = () => {
    $scope.tempCurrency = $scope.transaction.currency;
    $scope.tempFiat = $scope.transaction.fiat;
    $scope.toggleEditAmount();
  };

  $scope.changeTempCurrency = (curr) => {
    $scope.tempCurrency = curr;
    $scope.getMaxMin().then($scope.setParentError);
  };

  $scope.setParentError = () => $timeout(() => {
    $scope.$parent.fiatFormInvalid = $scope.tempFiatForm.$invalid && !$scope.needsKyc();
  });

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    $scope.tempCurrency = $scope.transaction.currency;
  });

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    $scope.tempFiat = $scope.transaction.fiat;
  });

  $scope.$watch('step', () => $scope.onStep('summary') && $scope.getMaxMin());
}
