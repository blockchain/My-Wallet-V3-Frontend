angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($scope, Alerts, Wallet, currency, buySell) {
  $scope.status = { loading: true };
  $scope.currencies = currency.coinifyCurrencies;
  $scope.settings = Wallet.settings;
  $scope.transaction = { fiat: 0, currency: $scope.settings.currency };
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];
  $scope.buy = buySell.openBuyView;

  buySell.init().finally(() => {
    $scope.trades = buySell.trades;
    $scope.exchange = buySell.getExchange();
    $scope.userHasExchangeAcct = $scope.exchange != null;
    $scope.status.loading = false;
  });

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = $scope.settings.currency;
    let success = () => { $scope.transaction.currency = curr; };
    Wallet.changeCurrency(curr).then(success);
  };

  $scope.cancel = (trade) => {
    Alerts.confirm('CONFIRM_CANCEL_TRADE', { action: 'CANCEL_TRADE', cancel: 'GO_BACK' })
      .then(() => trade.cancel().then(buySell.getTrades, Alerts.displayError));
  };

  $scope.$watch('settings.currency', $scope.changeCurrency, true);

  $scope.$watch('transaction.currency', () => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });
}
