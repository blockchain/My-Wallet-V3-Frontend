angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($timeout, $q, $uibModal, MyWallet, Alerts) {
  let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];

  const service = {
    getExchange: () => MyWallet.wallet.external.coinify,
    trades: { completed: [], pending: [] },
    tradesInitialized: false,
    init,
    getTrades,
    watchAddress,
    fetchProfile,
    openBuyView
  };

  return service;

  function init () {
    let exchange = service.getExchange();
    return exchange && exchange.user
      ? $q.resolve(service.fetchProfile())
      : $q.reject('USER_UNKNOWN');
  }

  function getTrades () {
    const success = (trades) => {
      service.trades.pending = trades.filter(t => pendingStates.indexOf(t.state) > -1);
      service.trades.completed = trades.filter(t => completedStates.indexOf(t.state) > -1);

      if (!service.tradesInitialized) {
        service.trades.completed.forEach(service.watchAddress);
        service.tradesInitialized = true;
      }

      return service.trades;
    };

    return service.getExchange().getTrades().then(success);
  }

  function watchAddress (trade) {
    if (trade.bitcoinReceived) return;
    trade.watchAddress().then(() => service.openBuyView(trade.inAmount, trade, '', true));
  }

  function fetchProfile () {
    const error = (err) => {
      let msg;
      try {
        msg = JSON.parse(err).error.toUpperCase();
      } catch (e) {
        msg = 'INVALID_REQUEST';
      }
      return $q.reject(msg);
    };

    return service.getExchange().fetchProfile().then(service.getTrades, error);
  }

  function openBuyView (amt, _trade, active, bitcoinReceived) {
    const open = () => $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal auto buy ' + active,
      controller: 'BuyCtrl',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        bitcoinReceived: () => bitcoinReceived || undefined,
        exchange: () => service.getExchange(),
        trades: () => service.trades || [],
        trade: () => _trade || null,
        fiat: () => amt
      }
    });

    try {
      let exchange = service.getExchange();
      if (service.trades.pending.length || service.trades.completed.length) open();
      else if (exchange.user) service.getTrades().then(open);
      else open();
    } catch (e) {
      open();
    }
  }
}
