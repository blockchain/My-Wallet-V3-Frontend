angular
  .module('walletApp')
  .controller('BuySummaryCtrl', BuySummaryCtrl);

function BuySummaryCtrl ($scope, $q, $timeout, Wallet, buySell, currency) {
  $scope.exchange = buySell.getExchange();
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;

  $scope.getMaxMin = () => {
    let limits = $scope.exchange.profile.level.limits;
    let dailyLimit = limits[$scope.method].in.daily;
    let activeTradesAmt = buySell.trades.pending.map(t => t.inAmount)
                                                .reduce((a, b) => a + b, 0);

    const calculateLimits = (rate) => {
      $scope.min = (rate * 10 + 0.01).toFixed(2);
      $scope.max = (rate * dailyLimit).toFixed(2);
      $scope.amtAvailable = ($scope.max - activeTradesAmt).toFixed(2);
    };

    let getRate = $scope.exchange.exchangeRate.get('EUR', $scope.tempCurrency.code);
    return $q.resolve(getRate).then(calculateLimits);
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
