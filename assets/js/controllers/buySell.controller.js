angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, Alerts, $state, $uibModal, MyWallet, Wallet, currency) {
  $scope.user = Wallet.user;
  $scope.status = {loading: true};
  $scope.currencies = currency.currencies;
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.currencySymbol = currency.conversions[$scope.fiatCurrency.code];
  $scope.profile = MyWallet.wallet.profile;
  $scope.user = Wallet.user;
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

    const error = (err) => {
      Alerts.displayError(err);
    };

    return $scope.exchange.getTrades().then(success, error);
  };

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;
    if (!$scope.user.isEmailVerified) { $scope.status = {}; return; }

    const success = () => {
      $scope.getTrades();
    };

    const error = (err) => {
      Alerts.displayError(err);
    };

    $scope.exchange.fetchProfile().then(success, error);
  };

  $scope.buy = () => {
    const success = () => {
      $uibModal.open({
        templateUrl: 'partials/buy-modal.jade',
        windowClass: 'bc-modal initial',
        controller: 'BuyCtrl',
        backdrop: 'static',
        keyboard: false,
        resolve: { exchange: () => $scope.exchange,
                   trades: () => $scope.trades || [],
                   fiat: () => $scope.transaction.fiat }
      });
    };

    if ($scope.exchange) $scope.getTrades().then(success);
    else success();
  };

  $scope.exchange ? $scope.fetchProfile() : $scope.status = {};

  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.$on('disableAllSteps', () => {
    $scope.allSteps = false;
    $scope.exchange = MyWallet.wallet.external.coinify;
  });
}
