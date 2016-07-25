angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, Alerts, $state, $uibModal, MyWallet, Wallet, currency) {
  $scope.status = { loading: true };
  $scope.currencies = currency.coinifyCurrencies;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.profile = MyWallet.wallet.profile;
  $scope.settings = Wallet.settings;
  $scope.transaction = {fiat: 0, currency: $scope.settings.currency};
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];
  $scope.userHasExchangeAcct = false;

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = $scope.settings.currency;

    const error = () => {};
    const success = () => { $scope.transaction.currency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.getTrades = () => {
    const success = (trades) => {
      $scope.status = {};
      $scope.trades = {};
      $scope.trades.pending = trades.filter(t => t.state === 'awaiting_transfer_in' ||
                                                 t.state === 'processing' ||
                                                 t.state === 'reviewing');
      $scope.trades.completed = trades.filter(t => t.state === 'expired' ||
                                                   t.state === 'rejected' ||
                                                   t.state === 'cancelled' ||
                                                   t.state === 'completed' ||
                                                   t.state === 'completed_test');
      $scope.userHasExchangeAcct = trades.length > 0;
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

  $scope.buy = (amt, _trade) => {
    const success = () => {
      $uibModal.open({
        templateUrl: 'partials/buy-modal.jade',
        windowClass: 'bc-modal auto buy',
        controller: 'BuyCtrl',
        backdrop: 'static',
        keyboard: false,
        resolve: { exchange: () => $scope.exchange,
                   trades: () => $scope.trades || [],
                   trade: () => _trade || null,
                   fiat: () => amt || $scope.transaction.fiat }
      });
    };

    try {
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

  // handle in trades service
  $scope.cancel = (trade) => {
    Alerts.confirm('CONFIRM_CANCEL_TRADE', {action: 'CANCEL_TRADE', cancel: 'GO_BACK'}).then(() => {
      const error = (err) => {
        Alerts.displayError(err);
      };

      trade.cancel().then($scope.getTrades, error);
    });
  };

  $scope.$watch('settings.currency', $scope.changeCurrency);

  $scope.$watch('transaction.currency', () => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.$on('initExchangeAcct', () => {
    $scope.userHasExchangeAcct = true;
    $scope.exchange = MyWallet.wallet.external.coinify;
    $scope.getTrades();
  });

  $scope.$on('initBuy', () => $scope.buy());
}
