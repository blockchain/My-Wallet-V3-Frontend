angular
  .module('walletApp')
  .controller('CoinifySummaryController', CoinifySummaryController);

function CoinifySummaryController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, buyMobile) {
  let quote = $scope.vm.quote;
  let medium = $scope.vm.medium;

  $scope.trade = {};
  $scope.trade.total = (quote.paymentMediums[medium].total / 100).toFixed(2);
  $scope.trade.methodFee = (quote.paymentMediums[medium].fee / 100).toFixed(2);
  $scope.trade.BTCAmount = currency.isBitCurrency(quote.baseCurrency) ? quote.baseAmount : quote.quoteAmount;
  $scope.trade.fiatAmount = currency.isBitCurrency(quote.baseCurrency) ? quote.quoteAmount : quote.baseAmount;

  $scope.$parent.limits = {};
  $scope.format = currency.formatCurrencyForView;
  $scope.btcCurrency = currency.bitCurrencies[0];
  $scope.exchange = buySell.getExchange();
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;

  $scope.isSell = $scope.$parent.$parent.isSell;
  $scope.sellTrade = $scope.$parent.$parent.trade;
  $scope.sellTransaction = $scope.$parent.$parent.transaction;

  $scope.$parent.fields = {rate: false};

  $scope.getMaxMin = (curr) => {
    const calculateMin = (rate) => {
      $scope.$parent.limits.min = (rate * 10).toFixed(2);
    };

    const calculateMax = (rate) => {
      $scope.$parent.limits.max = buySell.calculateMax(rate, $scope.medium).max;
      $scope.$parent.limits.available = buySell.calculateMax(rate, $scope.medium).available;
    };

    return buySell.fetchProfile(true).then(() => {
      let min = buySell.getRate('EUR', curr.code).then(calculateMin);
      let max = buySell.getRate($scope.exchange.profile.defaultCurrency, curr.code).then(calculateMax);
      return $q.all([min, max]).then($scope.setParentError);
    });
  };

  $scope.commitValues = () => {
    $scope.$parent.quote = null;
    $scope.status.waiting = true;
    $scope.transaction.currency = $scope.tempCurrency;
    $scope.transaction.fiat = $scope.tempFiat;
    $scope.getQuote().then(() => $scope.status.waiting = false);
    $scope.$parent.changeCurrencySymbol($scope.transaction.currency);
    $scope.toggleEditAmount();
  };

  $scope.cancel = () => {
    $scope.tempCurrency = $scope.transaction.currency;
    $scope.tempFiat = $scope.transaction.fiat;
    $scope.$parent.fiatFormInvalid = false;
    $scope.toggleEditAmount();
  };

  $scope.changeTempCurrency = (curr) => (
    $scope.getMaxMin(curr).then(() => { $scope.tempCurrency = curr; })
  );

  $scope.setParentError = () => {
    $timeout(() => {
      $scope.$parent.fiatFormInvalid = $scope.tempFiatForm.$invalid && !$scope.needsKyc();
    });
  };

  const completeTradeError = (err) => {
    $scope.status.waiting = false;
    $scope.$parent.error = JSON.parse(err);
  };

  $scope.buy = () => {
    $scope.lock();

    let success = (trade) => {
      $scope.vm.trade = trade;
      buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
    };

    buySell.accounts[0].buy()
                       .catch((e) => completeTradeError(e))
                       .then(success, $scope.standardError)
                       .then($scope.vm.watchAddress)
                       .then($scope.vm.goTo('isx'));
  };

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    $scope.tempCurrency = $scope.transaction.currency;
  });

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    $scope.tempFiat = $scope.transaction.fiat;
  });

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });

  $scope.$watch('sellRateForm', () => {
    $scope.$parent.$parent.sellRateForm = $scope.rateForm;
  });

  $scope.$watch('step', () => {
    if ($scope.onStep('summary')) {
      $scope.getMaxMin($scope.tempCurrency);

      // Get a new quote if using a fake quote.
      if (!$scope.$parent.quote.id && !$scope.$parent.sell) {
        $scope.$parent.quote = null;
        $scope.getQuote();
      }
    }
  });

  $scope.installLock();
}
