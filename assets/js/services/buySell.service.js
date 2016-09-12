angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($rootScope, $timeout, $q, $uibModal, Wallet, MyWallet, MyWalletHelpers, Alerts, currency, MyWalletBuySell) {
  let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
  let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];
  let watchableStates = ['completed', 'completed_test'];
  let tradeStateIn = (states) => (t) => states.indexOf(t.state) > -1;

  let txHashes = {};
  let watching = {};
  let initialized = $q.defer();

  let _buySellMyWallet;

  let buySellMyWallet = () => {
    if (!Wallet.status.isLoggedIn) {
      return null;
    }
    if (!_buySellMyWallet) {
      _buySellMyWallet = new MyWalletBuySell(MyWallet.wallet);
      if (_buySellMyWallet.exchanges) { // Absent if 2nd password set
        _buySellMyWallet.exchanges.coinify.partnerId = 18; // Replaced by Grunt for production
      }
    }
    return _buySellMyWallet;
  };

  const service = {
    getStatus: () => buySellMyWallet() && buySellMyWallet().status,
    getExchange: () => {
      if (!buySellMyWallet() || !buySellMyWallet().exchanges) return null; // Absent if 2nd password set
      return buySellMyWallet().exchanges.coinify;
    },
    trades: { completed: [], pending: [] },
    kycs: [],
    getTxMethod: (hash) => txHashes[hash] || null,
    initialized: () => initialized.promise,
    login: () => initialized.promise.finally(service.fetchProfile),
    init,
    getQuote,
    getKYCs,
    getRate,
    calculateMax,
    triggerKYC,
    getOpenKYC,
    getTrades,
    watchAddress,
    fetchProfile,
    openBuyView,
    pollUserLevel,
    getCurrency,
    signupForAccess,
    submitFeedback,
    resolveState
  };

  let unwatch = $rootScope.$watch(service.getExchange, (exchange) => {
    if (exchange) init(exchange).then(unwatch).then(initialized.resolve);
  });

  return service;

  function init (exchange) {
    if (exchange.trades) setTrades(exchange.trades);
    exchange.monitorPayments();
    return $q.resolve();
  }

  function getQuote (amt, curr) {
    return $q.resolve(service.getExchange().getBuyQuote(Math.trunc(amt * 100), curr));
  }

  function getKYCs () {
    return $q.resolve(service.getExchange().getKYCs()).then(kycs => {
      service.kycs = kycs.sort((k0, k1) => k1.createdAt > k0.createdAt);
      return service.kycs;
    });
  }

  function getRate (base, quote) {
    let getRate = service.getExchange().exchangeRate.get(base, quote);
    return $q.resolve(getRate);
  }

  function calculateMax (rate, method) {
    let currentLimit = service.getExchange().profile.currentLimits[method].inRemaining;
    let userLimits = service.getExchange().profile.level.limits;
    let dailyLimit = userLimits[method].inDaily;

    let limits = {};
    limits.max = (Math.round(((rate * dailyLimit) / 100)) * 100);
    limits.available = (rate * currentLimit).toFixed(2);

    limits.available > limits.max && (limits.available = limits.max);
    limits.available > 0 ? limits.available : 0;
    limits.max = limits.max.toFixed(2);

    return limits;
  }

  function triggerKYC () {
    return $q.resolve(service.getExchange().triggerKYC()).then(kyc => {
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
    return $q.resolve(service.getExchange().getTrades()).then(setTrades);
  }

  function setTrades (trades) {
    service.trades.pending = trades.filter(tradeStateIn(pendingStates));
    service.trades.completed = trades.filter(tradeStateIn(completedStates));

    service.trades.completed
      .filter(t => (
        tradeStateIn(watchableStates)(t) &&
        !t.bitcoinReceived &&
        !watching[t.receiveAddress]
      ))
      .forEach(service.watchAddress);

    service.trades.completed.forEach(t => {
      let type = t.isBuy ? 'buy' : 'sell';
      if (t.txHash) { txHashes[t.txHash] = type; }
    });

    return service.trades;
  }

  function watchAddress (trade) {
    watching[trade.receiveAddress] = true;
    trade.watchAddress().then(() => {
      if (trade.txHash && trade.isBuy) { txHashes[trade.txHash] = 'buy'; }
      service.openBuyView({ fiat: trade.inAmount / 100 }, trade, true);
    });
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

    return $q.resolve(service.getExchange().fetchProfile()).then(success, error);
  }

  function openBuyView (transaction, trade, bitcoinReceived) {
    return $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal auto buy',
      controller: 'BuyCtrl',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        bitcoinReceived: () => bitcoinReceived || undefined,
        trade: () => trade || null,
        transaction: () => transaction || {}
      }
    }).result;
  }

  function getCurrency (trade) {
    if (trade && trade.inCurrency) return currency.currencies.filter(t => t.code === trade.inCurrency)[0];
    let coinifyCurrencies = currency.coinifyCurrencies;
    let walletCurrency = Wallet.settings.currency;
    let isCoinifyCompatible = coinifyCurrencies.some(c => c.code === walletCurrency.code);
    let exchange = service.getExchange();
    let coinifyCode = exchange && exchange.profile ? exchange.profile.defaultCurrency : 'EUR';
    return isCoinifyCompatible ? walletCurrency : coinifyCurrencies.filter(c => c.code === coinifyCode)[0];
  }

  function signupForAccess (email, country) {
    let url = 'https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + country;
    let otherWindow = window.open(url);
    otherWindow.opener = null;
  }

  function submitFeedback (rating) {
    let url = 'https://docs.google.com/a/blockchain.com/forms/d/e/1FAIpQLSeKRzLKn0jsR19vkN6Bw4jK0QW-2pH6Ptb-LbFSaOqxOnbO-Q/viewform?entry.1125242796=' + rating;
    let otherWindow = window.open(url);
    otherWindow.opener = null;
  }

  function resolveState (state) {
    // maps a coinify state to one of: pending, rejected, expired, success
    return ({
      'pending': 'pending',
      'awaiting_transfer_in': 'pending',
      'failed': 'rejected',
      'rejected': 'rejected',
      'declined': 'rejected',
      'manual_rejected': 'rejected',
      'expired': 'expired',
      'completed': 'success',
      'completed_test': 'success',
      'manual_hold': 'review',
      'manual_review': 'review'
    })[state.toLowerCase()];
  }
}
