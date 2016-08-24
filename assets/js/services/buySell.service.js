angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($timeout, $q, $uibModal, Wallet, MyWallet, MyWalletHelpers, Alerts, currency) {
  let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];
  let watchableStates = ['completed', 'completed_test'];
  let tradeStateIn = (states) => (t) => states.indexOf(t.state) > -1;

  let receiveAddressMap = {};
  let watching = {};
  let initialized = $q.defer();

  const service = {
    getExchange: () => {
      if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
      var coinify = MyWallet.wallet.external.coinify;
      coinify.partnerId = 18; // Replaced by Grunt for production
      return coinify;
    },
    trades: { completed: [], pending: [] },
    kycs: [],
    getAddressMethod: (address) => receiveAddressMap[address] || null,
    initialized: () => initialized.promise,
    login: () => initialized.promise.finally(service.fetchProfile),
    init,
    getQuote,
    getKYCs,
    triggerKYC,
    getOpenKYC,
    getTrades,
    watchAddress,
    fetchProfile,
    openBuyView,
    pollUserLevel,
    getCurrency,
    resolveState
  };

  init().then(initialized.resolve, initialized.reject);
  return service;

  function init () {
    let exchange = service.getExchange();
    if (exchange && exchange.user) {
      // Get receive addresses from cached trade history:
      exchange.trades.forEach(t => {
        let type = t.isBuy ? 'buy' : 'sell';
        receiveAddressMap[t.receiveAddress] = type;
      });

      exchange.monitorPayments();

      return $q.resolve();
    } else {
      return $q.reject('USER_UNKNOWN');
    }
  }

  function getQuote (amt, curr) {
    return service.getExchange().getBuyQuote(amt, curr);
  }

  function getKYCs () {
    return service.getExchange().getKYCs().then(kycs => {
      service.kycs = kycs.sort((k0, k1) => k1.createdAt > k0.createdAt);
      return service.kycs;
    });
  }

  function triggerKYC () {
    return service.getExchange().triggerKYC().then(kyc => {
      service.kycs.unshift(kyc);
      return kyc;
    });
  }

  function pollUserLevel (kyc) {
    let profile = service.getExchange().profile;

    let pollUntil = (action, test) => $q((resolve) => {
      let stop;
      let exit = () => { stop(); resolve(); };
      let check = () => action().then(() => test() && exit());
      stop = MyWalletHelpers.exponentialBackoff(check);
    });

    let pollKyc = () => pollUntil(() => kyc.refresh(), () => kyc.state === 'completed');
    let pollProfile = () => pollUntil(() => profile.fetch(), () => +profile.level.name === 2);

    return $q.resolve(pollKyc().then(pollProfile));
  }

  function getOpenKYC () {
    return service.kycs.length ? $q.resolve(service.kycs[0]) : service.triggerKYC();
  }

  function getTrades () {
    const success = (trades) => {
      service.trades.pending = trades.filter(tradeStateIn(pendingStates));
      service.trades.completed = trades.filter(tradeStateIn(completedStates));

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
      service.getKYCs(),
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

  function openBuyView (amt, trade, active, bitcoinReceived) {
    const open = () => $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal auto buy ' + active,
      controller: 'BuyCtrl',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        bitcoinReceived: () => bitcoinReceived || undefined,
        trade: () => trade || null,
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

  function resolveState (state) {
    // maps a coinify state to one of: pending, rejected, expired, success
    return ({
      'pending': 'pending',
      'rejected': 'rejected',
      'declined': 'rejected',
      'failed': 'rejected',
      'expired': 'expired',
      'completed': 'success',
      'completed_test': 'success',
      'manual_rejected': 'rejected',
      'manual_hold': 'pending',
      'manual_review': 'pending'
    })[state.toLowerCase()];
  }
}
