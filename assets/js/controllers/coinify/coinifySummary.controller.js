angular
  .module('walletApp')
  .controller('CoinifySummaryController', CoinifySummaryController);

function CoinifySummaryController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, buyMobile) {
  let medium = $scope.vm.medium;
  let exchange = $scope.vm.exchange;

  $scope.state = {
    editAmount: false
  };

  $scope.format = currency.formatCurrencyForView;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;

  let setTrade = () => {
    let quote = $scope.vm.quote;
    let baseFiat = !currency.isBitCurrency({code: quote.baseCurrency});
    let fiatCurrency = baseFiat ? quote.baseCurrency : quote.quoteCurrency;
    $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
    $scope.dollars = currency.currencies.filter(c => c.code === fiatCurrency)[0];

    $scope.trade = {
      fee: (quote.paymentMediums[medium].fee / 100).toFixed(2),
      total: (quote.paymentMediums[medium].total / 100).toFixed(2),
      BTCAmount: !baseFiat ? quote.baseAmount : quote.quoteAmount,
      fiatAmount: baseFiat ? -quote.baseAmount / 100 : -quote.quoteAmount / 100,
      fiatCurrency: fiatCurrency
    };

    $scope.tempTrade = angular.copy($scope.trade);
  };

  setTrade();

  let getQuote = () => {
    return buySell.getQuote($scope.tempTrade.fiatAmount, $scope.tempTrade.fiatCurrency);
  };

  $scope.$parent.limits = {};

  $scope.isSell = $scope.$parent.$parent.isSell;
  $scope.sellTrade = $scope.$parent.$parent.trade;
  $scope.sellTransaction = $scope.$parent.$parent.transaction;

  $scope.$parent.fields = {rate: false};

  $scope.getMaxMin = (curr) => {
    const calculateMin = (rate) => {
      $scope.$parent.limits.min = (rate * 10).toFixed(2);
    };

    const calculateMax = (rate) => {
      $scope.$parent.limits.max = buySell.calculateMax(rate, medium).max;
      $scope.$parent.limits.available = buySell.calculateMax(rate, medium).available;
    };

    return buySell.fetchProfile(true).then(() => {
      let min = buySell.getRate('EUR', curr.code).then(calculateMin);
      let max = buySell.getRate(exchange.profile.defaultCurrency, curr.code).then(calculateMax);
      return $q.all([min, max]).then($scope.setParentError);
    });
  };

  $scope.commitValues = () => {
    $scope.lock();
    getQuote().then((q) => $scope.vm.quote = q)
              .then((q) => q.getPaymentMediums())
              .then(setTrade).then($scope.free)
              .finally(() => $scope.state.editAmount = false);
  };

  $scope.changeTempCurrency = (curr) => (
    $scope.getMaxMin(curr).then(() => { $scope.tempTrade.currency = curr; })
  );

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

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });

  $scope.$watch('sellRateForm', () => {
    $scope.$parent.$parent.sellRateForm = $scope.rateForm;
  });

  $scope.$watch('step', () => {
    if ($scope.onStep('summary')) $scope.getMaxMin($scope.tempTrade.currency);
  });

  $scope.installLock();
}
