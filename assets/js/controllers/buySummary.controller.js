angular
  .module('walletApp')
  .controller('BuySummaryCtrl', BuySummaryCtrl);

function BuySummaryCtrl ($scope, $q, $timeout, Wallet, buySell, currency) {
  $scope.limits = {};
  $scope.exchange = buySell.getExchange();
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;

  $scope.getMaxMin = () => {
    const calculateMin = (rate) => {
      $scope.limits.min = (rate * 10).toFixed(2);
    };

    const calculateMax = (rate) => {
      $scope.limits.max = buySell.calculateMax(rate, $scope.method).max;
      $scope.limits.available = buySell.calculateMax(rate, $scope.method).available;
    };

    buySell.fetchProfile().then(() => {
      let min = buySell.getRate('EUR', $scope.tempCurrency.code).then(calculateMin);
      let max = buySell.getRate($scope.exchange.profile.defaultCurrency, $scope.tempCurrency.code).then(calculateMax);
      $q.all([min, max]).then($scope.setParentError);
    });
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
    $scope.getMaxMin();
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
