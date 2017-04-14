angular
  .module('walletApp')
  .controller('CoinifySummaryController', CoinifySummaryController);

function CoinifySummaryController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, buyMobile) {
  let medium = $scope.vm.medium;
  let fiatCurrency = $scope.vm.fiatCurrency;
  let limits = $scope.limits = buySell.limits;
  let max = parseFloat(limits[medium].max[fiatCurrency()], 0);
  let min = parseFloat(limits[medium].min[fiatCurrency()], 0);

  $scope.state = {};
  $scope.format = currency.formatCurrencyForView;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;

  let setTrade = () => {
    let { quote, fiatCurrency, fiatAmount, BTCAmount } = $scope.vm;
    $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
    $scope.dollars = currency.currencies.filter(c => c.code === fiatCurrency())[0];

    $scope.trade = {
      fee: (quote.paymentMediums[medium].fee / 100).toFixed(2),
      total: (quote.paymentMediums[medium].total / 100).toFixed(2),
      BTCAmount: BTCAmount(),
      fiatAmount: fiatAmount(),
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

  $scope.buy = () => {
    $scope.lock();

    let success = (trade) => {
      $scope.vm.quote = null;
      $scope.vm.trade = trade;
      buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
    };

    buySell.accounts[0].buy()
                       .then(success)
                       .then(() => $scope.vm.goTo('isx'))
                       .then(() => $scope.vm.watchAddress())
                       .catch((e) => Alerts.displayError(JSON.parse(e).error_description));
  };

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });

  $scope.installLock();
}
