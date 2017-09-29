angular
  .module('walletApp')
  .factory('coinify', coinify);

function coinify (Env, BrowserHelper, $timeout, $q, $state, $uibModal, $uibModalStack, Wallet, MyWallet, MyWalletHelpers, Alerts, currency, MyWalletBuySell, BlockchainConstants, modals, MyBlockchainApi, Exchange) {
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

  const service = {
    get exchange () {
      return MyWallet.wallet.external.coinify;
    },
    get limits () {
      return service.exchange.profile.limits;
    },
    get kycs () {
      return service.exchange.kycs;
    },
    get userCanTrade () {
      return !service.exchange.user || service.exchange.profile.canTrade;
    },
    get balanceAboveMin () {
      return service.sellMax && service.sellMax > service.limits.blockchain.minimumInAmounts['BTC'];
    },
    get balanceAboveMax () {
      return service.sellMax && service.sellMax > service.limits.blockchain.outRemaining['BTC'];
    },
    get buyLimitRemaining () {
      let { limits } = service;
      let { defaultCurrency } = service.exchange.profile;
      return Math.max(limits.bank.inRemaining[defaultCurrency], limits.card.inRemaining[defaultCurrency]);
    },
    get userCanBuy () {
      return service.userCanTrade;
    },
    get userCanSell () {
      return service.userCanTrade && service.balanceAboveMin;
    },
    get disabledUntil () {
      return service.exchange.profile && Math.ceil((service.exchange.profile.canTradeAfter - Date.now()) / ONE_DAY_MS);
    },
    get buyReason () {
      let reason;
      let { profile, user } = service.exchange;

      if (!user) reason = 'user_needs_account';
      else if (!profile.canTrade) reason = profile.cannotTradeReason;
      else if (service.buyLimitRemaining) reason = 'has_remaining_buy_limit';
      else reason = 'user_can_trade';

      return reason;
    },
    get sellReason () {
      let reason;
      let { profile } = service.exchange;

      if (profile && !profile.canTrade) reason = profile.cannotTradeReason;
      else if (service.balanceAboveMax) reason = 'can_sell_max';
      else if (service.balanceAboveMin) reason = 'can_sell_remaining_balance';
      else if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else reason = 'user_can_trade';

      return reason;
    },
    get buyLaunchOptions () {
      let reason = service.buyReason;
      let { user, profile } = service.exchange;

      if (reason === 'has_remaining_buy_limit' && user && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
      else if (reason === 'awaiting_first_trade_completion') return { 'FINISH': service.openPendingTrade, 'CANCEL': service.cancelTrade };
    },
    get sellLaunchOptions () {
      let reason = service.sellReason;
      let { user, profile } = service.exchange;

      if (reason === 'can_sell_max' && user && profile.level && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
      else if (reason === 'not_enough_funds_to_sell') return { 'REQUEST': modals.openRequest, 'BUY': service.goToBuy };
      else if (reason === 'awaiting_first_trade_completion') return { 'FINISH': service.openPendingTrade, 'CANCEL': service.cancelTrade };
    },
    trades: { completed: [], pending: [] },
    getTxMethod: (hash) => txHashes[hash] || null,
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
    signupForAccess,
    tradeStateIn,
    cancelTrade,
    states,
    incrementBuyDropoff
  };

  return service;

  function init (coinify) {
    return Env.then(env => {
      coinify.partnerId = env.partners.coinify.partnerId;
      coinify.api.sandbox = !env.isProduction;
      if (coinify.trades) setTrades(coinify.trades);
      coinify.monitorPayments();
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

  function cancelTrade (trade) {
    let msg = 'CONFIRM_CANCEL_TRADE';
    if (!trade) trade = service.getPendingTrade();
    if (trade.medium === 'bank') msg = 'CONFIRM_CANCEL_BANK_TRADE';

    return Alerts.confirm(msg, {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => trade.cancel().then(() => Exchange.fetchProfile(service.exchange)).then(() => {
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

  function signupForAccess (email, country, state) {
    BrowserHelper.safeWindowOpen('https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + country + '&entry.387129390=' + state);
  }

  function incrementBuyDropoff (step) {
    MyBlockchainApi.incrementBuyDropoff(step);
  }
}
