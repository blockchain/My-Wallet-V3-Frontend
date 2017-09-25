angular
  .module('walletApp')
  .factory('coinify', coinify);

function coinify (Env, BrowserHelper, $timeout, $q, $state, $uibModal, $uibModalStack, Wallet, MyWallet, MyWalletHelpers, Alerts, currency, MyWalletBuySell, BlockchainConstants, modals, MyBlockchainApi) {
  const ONE_DAY_MS = 86400000;

  let states = {
    error: ['expired', 'rejected', 'cancelled'],
    success: ['completed', 'completed_test'],
    pending: ['awaiting_transfer_in', 'reviewing', 'processing', 'pending', 'updateRequested'],
    completed: ['expired', 'rejected', 'cancelled', 'completed', 'completed_test']
  };
  let tradeStateIn = (states) => (t) => states.indexOf(t.state) > -1;

  let txHashes = {};
  let watching = {};
  let initialized = $q.defer();

  const service = {
    get exchange () {
      return MyWallet.wallet.external.coinify;
    },
    get kycs () {
      return service.exchange.kycs;
    },
    get userCanTrade () {
      return !service.exchange.profile || service.exchange.profile.canTrade;
    },
    get balanceAboveMin () {
      return service.sellMax && service.sellMax > service.sellLimits.min;
    },
    get balanceAboveMax () {
      return service.sellMax && service.sellMax > service.sellLimits.max;
    },
    get userCanBuy () {
      return service.userCanTrade;
    },
    get userCanSell () {
      return service.sellLimits && service.userCanTrade && service.balanceAboveMin;
    },
    get disabledUntil () {
      return service.exchange.profile && Math.ceil((service.exchange.profile.canTradeAfter - Date.now()) / ONE_DAY_MS);
    },
    get buyReason () {
      let reason;
      let { limits } = service;
      let { profile } = service.exchange;

      if (profile && !profile.canTrade) reason = profile.cannotTradeReason;
      else if (limits && limits.max) reason = 'has_remaining_buy_limit';
      else if (!profile) reason = 'user_needs_account';
      else reason = 'user_can_trade';

      return reason;
    },
    get sellReason () {
      let reason;
      let { sellLimits } = service;
      let { profile } = service.exchange;

      if (!sellLimits) reason = 'loading_data';
      else if (service.balanceAboveMax) reason = 'can_sell_max';
      else if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else if (profile && !profile.canTrade) reason = profile.cannotTradeReason;
      else if (!sellLimits.max || service.balanceAboveMin) reason = 'can_sell_remaining_balance';
      else if (!profile) reason = 'user_needs_account';
      else reason = 'user_can_trade';

      return reason;
    },
    get buyLaunchOptions () {
      let reason = service.buyReason;
      let { profile } = service.exchange;

      if (reason === 'has_remaining_buy_limit' && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
    },
    get sellLaunchOptions () {
      let reason = service.sellReason;
      let { profile } = service.exchange;

      if (reason === 'not_enough_funds_to_sell') return { 'REQUEST': modals.openRequest, 'BUY': service.goToBuy };
      else if (reason === 'can_sell_max' && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
    },
    trades: { completed: [], pending: [] },
    limits: { bank: { max: {}, yearlyMax: {}, min: {} }, card: { max: {}, yearlyMax: {}, min: {} } },
    getTxMethod: (hash) => txHashes[hash] || null,
    initialized: () => initialized.promise,
    login: () => initialized.promise.finally(service.fetchProfile),
    goToBuy: () => $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'BUY_BITCOIN'}),
    setSellMax: (balance) => { service.sellMax = balance.amount / 1e8; service.sellFee = balance.fee; },
    init,
    buying,
    selling,
    getQuote,
    getSellQuote,
    triggerKYC,
    getOpenKYC,
    openPendingKYC,
    getPendingTrade,
    openPendingTrade,
    getTrades,
    watchAddress,
    fetchProfile,
    signupForAccess,
    submitFeedback,
    tradeStateIn,
    cancelTrade,
    states,
    isPendingSellTrade,
    incrementBuyDropoff,
    getLimits,
    getSellLimits
  };

  return service;

  function init (coinify) {
    return Env.then(env => {
      coinify.partnerId = env.partners.coinify.partnerId;
      coinify.api.sandbox = !env.isProduction;
      if (coinify.trades) setTrades(coinify.trades);
      coinify.monitorPayments();
      initialized.resolve();
    });
  }

  function buying () {
    return {
      reason: service.buyReason,
      isDisabled: !service.userCanBuy,
      isDisabledUntil: service.isDisabledUntil,
      launchOptions: service.buyLaunchOptions
    };
  }

  function selling () {
    return {
      reason: service.sellReason,
      isDisabled: !service.userCanSell,
      isDisabledUntil: service.isDisabledUntil,
      launchOptions: service.sellLaunchOptions
    };
  }

  function getQuote (amt, curr, quoteCurr) {
    if (curr === 'BTC') amt = -amt;
    return $q.resolve(service.exchange.getBuyQuote(Math.trunc(amt), curr, quoteCurr));
  }

  function getSellQuote (amt, curr, quoteCurr) {
    if (curr === 'BTC') amt = -amt;
    return $q.resolve(service.exchange.getSellQuote(Math.trunc(amt), curr, quoteCurr));
  }

  function getLimits (mediums, curr) {
    if (mediums.card) {
      service.limits.card.max = mediums.card.limitInAmounts;
      service.limits.card.min = mediums.card.minimumInAmounts;
    }
    if (mediums.bank) {
      service.limits.bank.max = mediums.bank.limitInAmounts;
      service.limits.bank.min = mediums.bank.minimumInAmounts;
    }

    let card = service.limits.card;
    let bank = service.limits.bank;
    service.limits.min = bank.min[curr] < card.min[curr] ? bank.min[curr] : card.min[curr];
    if (card.max) {
      service.limits.max = bank.max[curr] > card.max[curr] ? bank.max[curr] : card.max[curr];
    }
    return service.limits;
  }

  function getSellLimits (mediums) {
    let min = mediums.bank.minimumInAmounts['BTC'];
    let max = mediums.bank.limitInAmounts && mediums.bank.limitInAmounts['BTC'];

    max = max && service.sellMax > max ? max : service.sellMax;

    service.sellLimits = { min, max };
    return service.sellLimits;
  }

  function cancelTrade (trade) {
    let msg = 'CONFIRM_CANCEL_TRADE';
    if (trade.medium === 'bank') msg = 'CONFIRM_CANCEL_BANK_TRADE';

    return Alerts.confirm(msg, {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => trade.cancel().then(() => service.fetchProfile()).then(() => {
      // so when a trade is cancelled it moves to the completed table
      service.getTrades();
    }), () => {})
      .catch((e) => { Alerts.displayError('ERROR_TRADE_CANCEL'); });
  }

  function getOpenKYC () {
    if (service.kycs.length) {
      let kyc = service.kycs[0];
      return ['declined', 'rejected', 'expired'].indexOf(kyc.state) > -1 ? service.triggerKYC() : kyc;
    } else {
      return service.triggerKYC();
    }
  }

  function triggerKYC () {
    return $q.resolve(service.exchange.triggerKYC());
  }

  function openPendingKYC () {
    modals.openBuyView(null, service.getOpenKYC());
  }

  function getPendingTrade () {
    let trades = service.exchange.trades;
    return trades.filter((trade) => trade._state === 'awaiting_transfer_in')[0];
  }

  function openPendingTrade () {
    modals.openBuyView(null, service.getPendingTrade());
  }

  function getTrades () {
    return $q.resolve(service.exchange.getTrades()).then(setTrades);
  }

  function setTrades (trades) {
    service.trades.pending = trades.filter(tradeStateIn(states.pending));
    service.trades.completed = trades.filter(tradeStateIn(states.completed));

    service.trades.completed
      .filter(t => (
        tradeStateIn(states.success)(t) &&
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
      modals.openBuyView(null, trade, { bitcoinReceived: true });
    });
  }

  function fetchProfile () {
    let error = (err) => {
      let msg;
      try { msg = JSON.parse(err).error.toUpperCase(); } catch (e) { msg = 'INVALID_REQUEST'; }
      return $q.reject(msg);
    };

    return $q.resolve(service.exchange.fetchProfile()).then(() => {}, error);
  }

  function isPendingSellTrade (pendingTrade) {
    return (pendingTrade && (pendingTrade.state === 'awaiting_transfer_in' || pendingTrade.state === 'processing')) && (pendingTrade.medium === 'blockchain');
  }

  function signupForAccess (email, country, state) {
    BrowserHelper.safeWindowOpen('https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + country + '&entry.387129390=' + state);
  }

  function submitFeedback (rating) {
    BrowserHelper.safeWindowOpen('https://docs.google.com/a/blockchain.com/forms/d/e/1FAIpQLSeKRzLKn0jsR19vkN6Bw4jK0QW-2pH6Ptb-LbFSaOqxOnbO-Q/viewform?entry.1125242796=' + rating);
  }

  function incrementBuyDropoff (step) {
    MyBlockchainApi.incrementBuyDropoff(step);
  }
}
