angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, Alerts, $state, $uibModal, MyWallet, Wallet, currency) {
  $scope.status = { loading: true };
  $scope.currencies = currency.currencies;
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.currencySymbol = currency.conversions[$scope.fiatCurrency.code];
  $scope.profile = MyWallet.wallet.profile;
  $scope.transaction = {fiat: 0};
  $scope.allSteps = true;

  $scope.changeCurrency = (curr) => {
    const error = () => {};
    const success = () => { $scope.fiatCurrency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.getTrades = () => {
    const success = (trades) => {
      $scope.status = {};
      $scope.trades = trades;
      $scope.allSteps = $scope.trades.length < 1;
    };

    const error = () => $scope.status = {};

    return $scope.exchange.getTrades().then(success, error);
  };

  $scope.fetchProfile = () => {
    const error = (err) => {
      try {
        let e = JSON.parse(err);
        let msg = e.error.toUpperCase();
        Alerts.displayError(msg, true, $scope.alerts, {user: $scope.exchange.user});
      } catch (e) {
        Alerts.displayError('INVALID_REQUEST', true);
      }
    };

    $scope.exchange.fetchProfile().then($scope.getTrades, error);
  };

  $scope.buy = (amt) => {
    const success = () => {
      $uibModal.open({
        templateUrl: 'partials/buy-modal.jade',
        windowClass: 'bc-modal initial',
        controller: 'BuyCtrl',
        backdrop: 'static',
        keyboard: false,
        resolve: { exchange: () => $scope.exchange,
                   trades: () => $scope.trades || [],
                   fiat: () => amt || $scope.transaction.fiat }
      });
    };

    try {
      // Might need a loading state here
      if ($scope.exchange.user) $scope.getTrades().then(success);
      else success();
    } catch (e) {
      success();
    }
  };

  try {
    if ($scope.exchange.user) $scope.fetchProfile();
    else $scope.status = {};
  } catch (e) {
    $scope.status = {};
  }

  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.$on('disableAllSteps', () => {
    $scope.allSteps = false;
    $scope.exchange = MyWallet.wallet.external.coinify;
  });
}
