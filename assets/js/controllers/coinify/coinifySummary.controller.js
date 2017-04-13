angular
  .module('walletApp')
  .controller('CoinifySummaryController', CoinifySummaryController);

function CoinifySummaryController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, buyMobile) {
  let medium = $scope.vm.medium;
  let fiatCurrency = $scope.vm.fiatCurrency;
  let limits = $scope.limits = buySell.limits;
  let max = parseInt(limits[medium].max[fiatCurrency()], 0);
  let min = parseInt(limits[medium].min[fiatCurrency()], 0);

  $scope.state = {};
  $scope.format = currency.formatCurrencyForView;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;

  let setTrade = () => {
    let quote = $scope.vm.quote;
    let baseFiat = $scope.vm.baseFiat;
    let fiatCurrency = $scope.vm.fiatCurrency;
    $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
    $scope.dollars = currency.currencies.filter(c => c.code === fiatCurrency())[0];

    $scope.trade = {
      fee: (quote.paymentMediums[medium].fee / 100).toFixed(2),
      total: (quote.paymentMediums[medium].total / 100).toFixed(2),
      BTCAmount: !baseFiat() ? quote.baseAmount : quote.quoteAmount,
      fiatAmount: baseFiat() ? -quote.baseAmount / 100 : -quote.quoteAmount / 100,
      fiatCurrency: fiatCurrency()
    };

    $scope.tempTrade = angular.copy($scope.trade);
  };

  setTrade();
  $scope.state.editAmount = $scope.trade.fiatAmount > max || $scope.trade.fiatAmount < min;

  let getQuote = () => {
    return buySell.getQuote($scope.tempTrade.fiatAmount, $scope.tempTrade.fiatCurrency);
  };

  $scope.commitValues = () => {
    $scope.lock();
    getQuote().then((q) => $scope.vm.quote = q)
              .then((q) => q.getPaymentMediums())
              .then((mediums) => mediums[medium].getAccounts())
              .then((accounts) => buySell.accounts = accounts)
              .then(setTrade).then($scope.free)
              .finally(() => $scope.state.editAmount = false);
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

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });

  $scope.installLock();
}
