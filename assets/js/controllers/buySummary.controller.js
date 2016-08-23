angular
  .module('walletApp')
  .controller('BuySummaryCtrl', BuySummaryCtrl);

function BuySummaryCtrl ($scope, Wallet, buySell, currency) {
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;
  $scope.getMaxMin = () => {
    let limits = buySell.getExchange().profile.level.limits;
    let dailyLimit = limits[$scope.method].in.daily;
    let activeTradesAmt = buySell.trades.pending.map(t => t.inAmount)
                                                .reduce((a, b) => a + b);

    const success = (rate) => {
      $scope.min = parseFloat((rate * 10).toFixed(2)) + 0.01;
      $scope.max = parseFloat((rate * dailyLimit)).toFixed(2);
      $scope.amtAvailable = parseFloat($scope.max - activeTradesAmt).toFixed(2);

      $scope.$safeApply();
      if ($scope.tempFiatForm.$error.max ||
          $scope.tempFiatForm.$error.min) $scope.$parent.editAmount = true;
    };

    buySell.getExchange().exchangeRate.get('EUR', $scope.transaction.currency.code)
                                      .then(success);
  };

  let needsUpdate = () => {
    return $scope.transaction.fiat !== $scope.transaction.tempFiat ||
           $scope.transaction.currency !== $scope.transaction.tempCurrency;
  };

  $scope.updateAmounts = () => {
    if (!needsUpdate()) return;
    $scope.changeTempAmount();
    $scope.changeCurrency($scope.transaction.tempCurrency);
    $scope.getMaxMin();
  };

  $scope.changeTempCurrency = (curr) => {
    $scope.transaction.tempCurrency = curr;
  };

  $scope.changeTempAmount = () => {
    $scope.transaction.fiat = $scope.transaction.tempFiat;
  };

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    $scope.transaction.tempCurrency = $scope.transaction.currency;
  });

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    $scope.transaction.tempFiat = $scope.transaction.fiat;
  });

  $scope.$watch('step', () => $scope.onStep('summary') && $scope.getMaxMin());
}
