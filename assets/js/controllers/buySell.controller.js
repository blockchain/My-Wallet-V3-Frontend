angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, Alerts, $state, $uibModalStack, $uibModal, MyWallet, Wallet, currency, $timeout) {
  $scope.status = { loading: true };
  $scope.currencies = currency.coinifyCurrencies;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.settings = Wallet.settings;
  $scope.transaction = {fiat: 0, currency: $scope.settings.currency};
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];
  $scope.trades = { completed: [], pending: [] };
  $scope.userHasExchangeAcct = false;

  $scope.pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  $scope.completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = $scope.settings.currency;

    const error = () => {};
    const success = () => { $scope.transaction.currency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.getTrades = () => {
    const success = (trades) => {
      $timeout(() => $scope.status = {}, 1000);

      $scope.trades.pending = trades.filter(t => $scope.pendingStates.indexOf(t.state) > -1);
      $scope.trades.completed = trades.filter(t => $scope.completedStates.indexOf(t.state) > -1);

      if (!$rootScope.tradesInitialized) {
        for (let trade of $scope.trades.completed) {
          $scope.watchAddress(trade);
        }
      }

      $rootScope.tradesInitialized = true;
      $scope.userHasExchangeAcct = $scope.trades.pending.length || $scope.trades.completed.length;
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

  $scope.buy = (amt, _trade, active, bitcoinReceived) => {
    const success = () => {
      $uibModal.open({
        templateUrl: 'partials/buy-modal.jade',
        windowClass: 'bc-modal auto buy ' + active,
        controller: 'BuyCtrl',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          bitcoinReceived: () => bitcoinReceived || undefined,
          exchange: () => $scope.exchange,
          trades: () => $scope.trades || [],
          trade: () => _trade || null,
          fiat: () => amt || $scope.transaction.fiat
        }
      });
    };

    try {
      if ($scope.trades.pending.length || $scope.trades.completed.length) success();
      else if ($scope.exchange.user) $scope.getTrades().then(success);
      else success();
    } catch (e) {
      success();
    }
  };

  $scope.watchAddress = (trade) => {
    if (trade.bitcoinReceived) return;
    trade.watchAddress().then(() => {
      $scope.buy(trade.inAmount, trade, '', true);
    });
  };

  // handle in trades service
  $scope.cancel = (trade) => {
    Alerts.confirm('CONFIRM_CANCEL_TRADE', {action: 'CANCEL_TRADE', cancel: 'GO_BACK'}).then(() => {
      const error = (err) => {
        Alerts.displayError(err);
      };

      trade.cancel().then($scope.getTrades, error);
    });
  };

  try {
    if ($scope.exchange.user) $scope.fetchProfile();
    else $scope.status = {};
  } catch (e) {
    $scope.status = {};
  }

  $scope.$watch('settings.currency', $scope.changeCurrency);

  $scope.$watch('transaction.currency', () => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.$on('fetchTrades', () => {
    $scope.exchange = MyWallet.wallet.external.coinify;

    let completed = $scope.trades.completed.length;

    $scope.getTrades().then(() => {
      if (completed < $scope.trades.completed.length) {
        let trade = $scope.trades.completed.slice(-1)[0];
        $scope.watchAddress(trade);
      }
    });
  });

  $scope.$on('initBuy', () => $scope.buy());
}
