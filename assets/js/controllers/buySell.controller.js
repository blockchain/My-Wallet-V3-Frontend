angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($scope, Alerts, Wallet, currency, buySell, MyWallet) {
  $scope.status = { loading: true };
  $scope.currencies = currency.coinifyCurrencies;
  $scope.settings = Wallet.settings;
  $scope.transaction = { fiat: 0, currency: $scope.settings.currency };
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];
  $scope.buy = buySell.openBuyView;
  $scope.state = {buy: true};

  // for quote
  if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();

  buySell.initialized().finally(() => {
    $scope.trades = buySell.trades;
    $scope.exchange = buySell.getExchange();
    $scope.status.loading = false;

    if (!$scope.exchange) {
      $scope.$watch(buySell.getExchange, (ex) => $scope.exchange = ex);
    } else if (+$scope.exchange.profile.level.name < 2) {
      buySell.getKYCs().then(kycs => {
        if (kycs.length > 0) {
          $scope.kyc = kycs[0];
          buySell.pollUserLevel($scope.kyc)
            .then(() => Alerts.displaySuccess('Account has been upgraded!'));
        }
      });
    }
  });

  $scope.changeCurrency = (curr) => {
    if (!curr) return;
    let success = () => { $scope.transaction.currency = curr; };
    Wallet.changeCurrency(curr).then(success);
  };

  $scope.$watch('settings.currency', () => {
    $scope.transaction.currency = buySell.getCurrency();
  }, true);

  $scope.$watch('transaction.currency', () => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });
}
