angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell (Env, BrowserHelper, $timeout, $q, $state, $uibModal, $uibModalStack, Wallet, MyWallet, MyWalletHelpers, Alerts, currency, MyWalletBuySell, BlockchainConstants, modals, MyBlockchainApi) {
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

  let poll;
  let maxPollTime = 30000;

  let _buySellMyWallet;

  let buySellMyWallet = () => {
    if (!Wallet.status.isLoggedIn) {
      return null;
    }
    if (!_buySellMyWallet) {
      _buySellMyWallet = new MyWalletBuySell(MyWallet.wallet, false);
      Env.then(env => {
        _buySellMyWallet.debug = env.buySellDebug;
      });
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
    mediums: [],
    accounts: [],
    limits: { bank: { max: {}, maxOutRemaining: {}, yearlyMax: {}, min: {} }, card: { max: {}, yearlyMax: {}, min: {} } },
    getTxMethod: (hash) => txHashes[hash] || null,
    initialized: () => initialized.promise,
    login: () => initialized.promise.finally(service.fetchProfile),
    init,
    getQuote,
    getSellQuote,
    getKYCs,
    getRate,
    triggerKYC,
    getOpenKYC,
    getTrades,
    watchAddress,
    fetchProfile,
    openSellView,
    pollKYC,
    pollUserLevel,
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
      coinify.api.testnet = env.network === 'testnet';
      if (coinify.trades) setTrades(coinify.trades);
      coinify.monitorPayments();
      initialized.resolve();
    });
  }

  function getQuote (amt, curr, quoteCurr) {
    if (curr === 'BTC') {
      amt = Math.trunc(amt * 100000000);
    } else {
      amt = Math.trunc(amt * 100);
    }
    return $q.resolve(service.getExchange().getBuyQuote(amt, curr, quoteCurr));
  }

  function getSellQuote (amt, curr, quoteCurr) {
    if (curr === 'BTC') {
      amt = Math.trunc(amt * 100000000);
    } else {
      amt = Math.trunc(amt * 100);
    }
    return $q.resolve(service.getExchange().getSellQuote(amt, curr, quoteCurr));
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
    let max = mediums.bank.limitInAmounts ? mediums.bank.limitInAmounts['BTC'] : undefined;
    service.sellLimits = { min, max };
    return service.sellLimits;
  }

  function triggerKYC () {
    return $q.resolve(service.getExchange().triggerKYC()).then(kyc => {
      service.kycs.unshift(kyc);
      return kyc;
    });
  }

  function pollKYC () {
    let kyc = service.kycs[0];

    if (kyc && kyc.state !== 'pending') { return; }
    if (poll && poll.$$state.status === 0) { return; }

    poll = service.pollUserLevel(kyc).result
      .then(() => Alerts.displaySuccess('KYC_APPROVED', true))
      .then(() => {
        $state.go('wallet.common.buy-sell');
        $uibModalStack.dismissAll();
      });
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

  function pollUserLevel (kyc) {
    let stop;
    let profile = service.getExchange().profile;

    let pollUntil = (action, test) => $q((resolve) => {
      let exit = () => { stop(); resolve(); };
      let check = () => action().then(() => test() && exit());
      stop = MyWalletHelpers.exponentialBackoff(check, maxPollTime);
    });

    let pollKyc = () => pollUntil(() => kyc && kyc.refresh(), () => kyc.state === 'completed');
    let pollProfile = () => pollUntil(() => profile.fetch(), () => +profile.level.name === 2);

    return {
      cancel: () => stop && stop(),
      result: $q.resolve(pollKyc().then(pollProfile))
    };
  }

  function getOpenKYC () {
    if (service.kycs.length) {
      let kyc = service.kycs[0];
      return ['declined', 'rejected', 'expired'].indexOf(kyc.state) > -1 ? service.triggerKYC() : kyc;
    } else {
      return service.triggerKYC();
    }
  }

  function getTrades () {
    return $q.resolve(service.getExchange().getTrades()).then(setTrades);
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

    return $q.resolve(service.getExchange().fetchProfile()).then(() => {}, error);
  }

  function openSellView (trade, bankMedium, payment, buySellOptions = { sell: true }) {
    let exchange = service.getExchange();
    return $uibModal.open({
      templateUrl: 'partials/coinify-sell-modal.pug',
      windowClass: 'bc-modal buy',
      controller: 'CoinifySellController',
      controllerAs: 'vm',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        trade: () => trade,
        bankMedium: () => {
          if (exchange.profile && !trade.state) return bankMedium;
        },
        accounts: () => {
          if (exchange.profile && !trade.state) {
            return bankMedium.getBankAccounts().then(bankAccounts => {
              return bankAccounts;
            });
          }
        },
        buySellOptions: () => buySellOptions,
        payment: () => payment || undefined
      }
    }).result;
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
