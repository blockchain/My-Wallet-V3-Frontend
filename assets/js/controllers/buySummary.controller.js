angular
  .module('walletApp')
  .controller('BuySummaryCtrl', BuySummaryCtrl);

function BuySummaryCtrl ($scope, Wallet, buySell, currency) {
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;
  $scope.getMaxMin = () => {
    let limits = buySell.getExchange().profile.level.limits;
    let dailyLimit = limits[$scope.method].in.daily;

    let activeTradesAmt = 0;
    for (var i in buySell.getExchange().trades.pending) { activeTradesAmt += buySell.getExchange().trades[i].inAmount; }

    const getEuroRate = (rate) => {
      $scope.minEuroRate = rate * 10;
      $scope.maxEuroRate = rate * dailyLimit;
      $scope.amtAvailableRate = rate * (dailyLimit - activeTradesAmt);

      buySell.getExchange().exchangeRate.get($scope.transaction.currency.code, 'BTC')
                                        .then(success);
    };

    const success = (rate) => {
      $scope.max = parseFloat(((1 / rate) * $scope.maxEuroRate).toFixed(2));
      $scope.min = parseFloat(((1 / rate) * $scope.minEuroRate).toFixed(2)) + 0.01;
      $scope.amtAvailable = parseFloat(((1 / rate) * $scope.amtAvailableRate).toFixed(2));
    };

    buySell.getExchange().exchangeRate.get('EUR', 'BTC')
                                      .then(getEuroRate);
  };

  $scope.updateAmounts = () => {
    $scope.changeTempAmount();
    $scope.changeCurrency($scope.transaction.tempCurrency);
    $scope.toggleEditAmount();
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
