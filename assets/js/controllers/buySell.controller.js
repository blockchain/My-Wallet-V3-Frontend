angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($scope, $state, Alerts, Wallet, currency, buySell, MyWallet) {
  $scope.status = { loading: true };
  $scope.currencies = currency.coinifyCurrencies;
  $scope.settings = Wallet.settings;
  $scope.transaction = { fiat: undefined, currency: $scope.settings.currency };
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];
  $scope.buy = buySell.openBuyView;
  $scope.state = {buy: true};
  $scope.limits = {};

  $scope.poll = () => {
    buySell.pollUserLevel($scope.kyc)
      .then(() => Alerts.displaySuccess('KYC_APPROVED', true))
      .then(() => {
        $scope.buy();
        $state.go('wallet.common.buy-sell');
      });
  };

  $scope.getMaxMin = () => {
    const calculateLimits = (rate) => {
      $scope.limits.bank = buySell.calculateLimits(rate, 'bank');
      $scope.limits.card = buySell.calculateLimits(rate, 'card');
    };

    buySell.getRate('EUR', $scope.transaction.currency.code).then(calculateLimits);
  };

  // for quote
  buySell.getExchange();

  buySell.login().finally(() => {
    $scope.trades = buySell.trades;
    $scope.kyc = buySell.kycs[0];
    $scope.exchange = buySell.getExchange();
    $scope.status.loading = false;
    $scope.getMaxMin();

    let unwatchKycs = $scope.$watch(() => buySell.kycs.length, () => $scope.kyc = buySell.kycs[0]);

    if ($scope.exchange) {
      if (+$scope.exchange.profile.level.name < 2) {
        if ($scope.kyc) return $scope.poll();
        buySell.getKYCs().then(kycs => {
          if (kycs.length > 0) $scope.poll();
        });
      } else {
        unwatchKycs();
      }
    } else {
      $scope.$watch(buySell.getExchange, (ex) => $scope.exchange = ex);
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

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
    if (newVal !== oldVal) $scope.getMaxMin();
  });
}
