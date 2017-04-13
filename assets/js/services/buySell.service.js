angular
  .module('walletApp')
  .factory('buySell', buySell);

function buySell ($rootScope, $timeout, $q, $state, $uibModal, $uibModalStack, Wallet, MyWallet, MyWalletHelpers, Alerts, currency, MyWalletBuySell, Options, BlockchainConstants, modals) {
  let states = {
    error: ['expired', 'rejected', 'cancelled'],
    success: ['completed', 'completed_test'],
    pending: ['awaiting_transfer_in', 'reviewing', 'processing', 'pending'],
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
      _buySellMyWallet = new MyWalletBuySell(MyWallet.wallet, $rootScope.buySellDebug);
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
    limits: { bank: { max: {} }, card: { max: {} } },
    getTxMethod: (hash) => txHashes[hash] || null,
    initialized: () => initialized.promise,
    login: () => initialized.promise.finally(service.fetchProfile),
    init,
    getQuote,
    getSellQuote,
    getKYCs,
    getRate,
    calculateMax,
    getMaxLimits,
    getMinLimits,
    triggerKYC,
    getOpenKYC,
    getTrades,
    watchAddress,
    fetchProfile,
    openSellView,
    pollKYC,
    pollUserLevel,
    getCurrency,
    signupForAccess,
    submitFeedback,
    tradeStateIn,
    cancelTrade,
    states,
    getBankAccounts,
    createBankAccount,
    deleteBankAccount,
    createSellTrade
  };

  return service;

  function init (coinify) {
    return Options.get().then(options => {
      coinify.partnerId = options.partners.coinify.partnerId;
      coinify.api.testnet = BlockchainConstants.NETWORK === 'testnet';
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

  function getBankAccounts () {
    return $q.resolve(service.getExchange().bank.getAll())
      .then(accounts => {
        if (accounts) {
          return accounts;
        } else {
          return [];
        }
      })
      .catch(e => {
        console.log('error getting accounts', e);
        return e;
      });
  }

  function createBankAccount (bankObject) {
    return $q.resolve(service.getExchange().bank.create(bankObject)).then(response => {
      return response;
    });
  }

  function deleteBankAccount (bankId) {
    return $q.resolve(service.getExchange().bank.deleteOne(bankId)).then(response => {
      return response;
    });
  }

  function createSellTrade (quote, bank) {
    return $q.resolve(service.getExchange().sell(quote, bank)).then(response => {
      console.log('*** SELL TRADE RESPONSE ***', response);
      return response;
    })
    .then(data => {
      service.getTrades();
      return data;
    })
    .catch(err => {
      return err;
    });
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

  function getMaxLimits (defaultCurrency) {
    const calculateMax = (rate, curr) => {
      service.limits.bank.max[curr] = service.calculateMax(rate, 'bank');
      service.limits.card.max[curr] = service.calculateMax(rate, 'card');
      service.limits.absoluteMax = (curr) => {
        let cardMax = parseInt(service.limits.card.max[curr], 0);
        let bankMax = parseInt(service.limits.bank.max[curr], 0);
        return bankMax > cardMax ? bankMax : cardMax;
      };
    };

    let getMax = (c) => service.getRate(defaultCurrency, c).then(r => calculateMax(r, c));
    return $q.all(['DKK', 'EUR', 'USD', 'GBP'].map(getMax));
  }

  function calculateMax (rate, medium) {
    let limit = service.getExchange().profile.currentLimits[medium].inRemaining;
    return (rate * limit).toFixed(2);
  }

  function getMinLimits (quote, fiatCurrency) {
    if (service.limits.bank.min && service.limits.card.min) return $q.resolve();

    const calculateMin = (mediums) => {
      service.limits.bank.min = mediums.bank.minimumInAmounts;
      service.limits.card.min = mediums.bank.minimumInAmounts;
      service.limits.absoluteMin = (curr) => {
        let cardMin = parseInt(service.limits.card.min[curr], 0);
        let bankMin = parseInt(service.limits.bank.min[curr], 0);
        return bankMin > cardMin ? bankMin : cardMin;
      };
    };

    return quote.getPaymentMediums().then(calculateMin);
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
    return service.kycs.length ? $q.resolve(service.kycs[0]) : service.triggerKYC();
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

  function openSellView (trade, buySellOptions = { sell: true }) {
    return $uibModal.open({
      templateUrl: 'partials/coinify-sell-modal.pug',
      windowClass: 'bc-modal auto buy',
      controller: 'CoinifySellController',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        accounts: () => service.getBankAccounts(),
        trade: () => trade,
        buySellOptions: () => buySellOptions,
        options: () => Options.get()
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

  function signupForAccess (email, country, state) {
    $rootScope.safeWindowOpen('https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + country + '&entry.387129390=' + state);
  }

  function submitFeedback (rating) {
    $rootScope.safeWindowOpen('https://docs.google.com/a/blockchain.com/forms/d/e/1FAIpQLSeKRzLKn0jsR19vkN6Bw4jK0QW-2pH6Ptb-LbFSaOqxOnbO-Q/viewform?entry.1125242796=' + rating);
  }
}
