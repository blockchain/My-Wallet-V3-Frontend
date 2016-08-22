angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($timeout, $q, $uibModal, Wallet, MyWallet, Alerts, currency) {
  let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];
  let watchableStates = ['completed', 'completed_test'];
  let tradeStateIn = (states) => (t) => states.indexOf(t.state) > -1;

  let receiveAddressMap = {};
  let watching = {};
  let initialized = $q.defer();

  const service = {
    getExchange: () => MyWallet.wallet.external.coinify,
    trades: { completed: [], pending: [] },
    getAddressMethod: (address) => receiveAddressMap[address] || null,
    initialized: () => initialized.promise,
    init,
    getQuote,
    getTrades,
    watchAddress,
    fetchProfile,
    openBuyView,
    getCurrency
  };

  init().then(initialized.resolve, initialized.reject);
  return service;

  function init () {
    let exchange = service.getExchange();

    if (exchange && exchange.user) {
      // Get receive addresses from cached trade history:
      service.getExchange().trades.forEach(t => {
        let type = t.outCurrency === 'BTC' ? 'buy' : 'sell';
        receiveAddressMap[t.receiveAddress] = type;
      });
      return $q.resolve();
    } else {
      return $q.reject('USER_UNKNOWN');
    }
  }

  function getQuote (amt, curr) {
    const success = (quote) => {
      return quote;
    };

    return service.getExchange().getBuyQuote(amt, curr).then(success);
  }

  function getTrades () {
    const success = (trades) => {
      service.trades.pending = trades.filter(tradeStateIn(pendingStates));
      service.trades.completed = trades.filter(tradeStateIn(completedStates));

      trades.forEach(t => {
        let type = t.outCurrency === 'BTC' ? 'buy' : 'sell';
        receiveAddressMap[t.receiveAddress] = type;
      });

      service.trades.completed
        .filter(t => (
          tradeStateIn(watchableStates)(t) &&
          !t.bitcoinReceived &&
          !watching[t.receiveAddress]
        ))
        .forEach(service.watchAddress);

      return service.trades;
    };

    return service.getExchange().getTrades().then(success);
  }

  function watchAddress (trade) {
    watching[trade.receiveAddress] = true;
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
