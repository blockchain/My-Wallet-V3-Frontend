angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($timeout, $q, $uibModal, Wallet, MyWallet, Alerts, currency) {
  let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];
  let receiveAddressMap = {};
  let initialized = $q.defer();

  const service = {
    getExchange: () => MyWallet.wallet.external.coinify,
    trades: { completed: [], pending: [] },
    getAddressMethod: (address) => receiveAddressMap[address] || null,
    initialized: () => initialized.promise,
    init,
    getTrades,
    watchAddress,
    fetchProfile,
    openBuyView,
    getCurrency
  };

  init().then(initialized.resolve);
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

      trades.forEach(t => {
        let type = t.outCurrency === 'BTC' ? 'buy' : 'sell';
        receiveAddressMap[t.receiveAddress] = type;
      });

      service.trades.completed
        .filter(t => !t.bitcoinReceived)
        .forEach(service.watchAddress);

      return service.trades;
    };

    return service.getExchange().getTrades().then(success);
  }

  function watchAddress (trade) {
    if (trade.bitcoinReceived) return;
    trade.watchAddress().then(() => service.openBuyView(trade.inAmount, trade, '', true));
  }

  function fetchProfile () {
    let success = () => $q.all([
      service.getTrades(),
      service.getExchange().getBuyCurrencies().then(currency.updateCoinifyCurrencies)
    ]);

    let error = (err) => {
      let msg;
      try {
        msg = JSON.parse(err).error.toUpperCase();
      } catch (e) {
        msg = 'INVALID_REQUEST';
      }
      return $q.reject(msg);
    };

    return service.getExchange().fetchProfile().then(success, error);
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

  function getCurrency () {
    let coinifyCurrencies = currency.coinifyCurrencies;
    let walletCurrency = Wallet.settings.currency;
    let isCoinifyCompatible = coinifyCurrencies.some(c => c.code === walletCurrency.code);
    return isCoinifyCompatible ? walletCurrency : coinifyCurrencies[0];
  }
}
