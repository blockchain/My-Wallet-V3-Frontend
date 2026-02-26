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

  const service = {
    get exchange () {
      return MyWallet.wallet.external.coinify;
    },
    get limits () {
      return service.exchange.profile.limits;
    },
    get trades () {
      return service.exchange.trades;
    },
    get subscriptions () {
      return service.exchange.subscriptions;
    },
    get kycs () {
      return service.exchange.kycs.sort((a, b) => a.createdAt < b.createdAt);
    },
    get userCanTrade () {
      return !service.exchange.user || service.exchange.profile.canTrade;
    },
    get remainingBelowMin () {
      return service.limits.blockchain.inRemaining['BTC'] < service.limits.blockchain.minimumInAmounts['BTC'];
    },
    get balanceAboveMin () {
      return Exchange.sellMax && Exchange.sellMax > service.limits.blockchain.minimumInAmounts['BTC'];
    },
    get balanceAboveMax () {
      return Exchange.sellMax && Exchange.sellMax > service.limits.blockchain.inRemaining['BTC'];
    },
    get usercanTrade () {
      return service.userCanTrade;
    },
    get userCanSell () {
      return service.balanceAboveMin && !service.remainingBelowMin;
    },
    get needsMoreTradesForRecurring () {
      return service.trades.filter((t) => service.tradeStateIn(states.completed)(t) && !t.tradeSubscriptionId && t.medium === 'card').length < 3;
    },
    get buyReason () {
      let reason;
      let { profile, user } = service.exchange;

      if (user && !profile.canTrade) reason = profile.cannotTradeReason;
      else if (!user) reason = 'user_needs_account';
      else reason = 'has_remaining_buy_limit';

      return reason;
    },
    get sellReason () {
      let reason;

      if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else if (service.remainingBelowMin) reason = 'max_remaining_below_min';
      else if (service.balanceAboveMin) reason = 'can_sell_remaining_balance';
      else if (service.balanceAboveMax) reason = 'can_sell_max';
      else reason = 'user_needs_account';

      return reason;
    },
    get buyLaunchOptions () {
      let reason = service.buyReason;
      let { user, profile } = service.exchange;

      if (reason === 'has_remaining_buy_limit' && user && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
      if (reason === 'awaiting_first_trade_completion' && service.getPendingTrade()) return { 'FINISH': service.openPendingTrade, 'CANCEL': service.cancelTrade };
      if (reason === 'awaiting_first_trade_completion' && service.getProcessingTrade()) return { 'CHECK_STATUS': service.openProcessingTrade };
      if (reason === 'after_first_trade') return { 'WHY': service.openTradingDisabledHelper };
    },
    get sellLaunchOptions () {
      let reason = service.sellReason;
      let { user, profile } = service.exchange;

      if (reason === 'can_sell_max' && user && profile.level && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
      if (reason === 'max_remaining_below_min' && +profile.level.name < 2) return { 'KYC': service.openPendingKYC };
      if (reason === 'not_enough_funds_to_sell') return { 'REQUEST': modals.openRequest, 'BUY': service.goToBuy };
    },
    states,
    getTxMethod: (hash) => {
      let trade = service.trades.filter((t) => t.txHash === hash)[0];
      return trade && (trade.isBuy ? 'buy' : 'sell');
    },
    tradeStateIn: (states) => (t) => states.indexOf(t.state) > -1,
    goToBuy: () => $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'BUY_BITCOIN'})
  };

  service.init = (coinify) => {
    return Env.then(env => {
      coinify.api.sandbox = !env.isProduction;
      coinify.partnerId = env.partners.coinify.partnerId;
      service.disabled = env.partners.coinify.disabled;
      service.disabledReason = env.partners.coinify.disabledReason;
      if (coinify.trades) Exchange.watchTrades(coinify.trades);
      coinify.monitorPayments();
    });
  };

  service.buying = () => {
    return {
      reason: service.buyReason,
      isDisabled: !service.usercanTrade,
      launchOptions: service.buyLaunchOptions
    };
  };

  service.selling = () => {
    return {
      reason: service.sellReason,
      isDisabled: !service.userCanSell,
      launchOptions: service.sellLaunchOptions
    };
  };

  service.getQuote = (amt, curr, quoteCurr) => {
    if (curr === 'BTC') amt = -amt;
    return $q.resolve(service.exchange.getBuyQuote(Math.trunc(amt), curr, quoteCurr));
  };

  service.getSellQuote = (amt, curr, quoteCurr) => {
    if (curr === 'BTC') amt = -amt;
    return $q.resolve(service.exchange.getSellQuote(Math.trunc(amt), curr, quoteCurr));
  };

  service.cancelTrade = (trade, message, subscription) => {
    let msg = message || 'CONFIRM_CANCEL_TRADE';
    if (!trade) trade = service.getPendingTrade();
    if (trade.medium === 'bank') msg = 'CONFIRM_CANCEL_BANK_TRADE';

    let checkForSubAndFetch = () => {
      let getSubs = (subs) => subs.filter(s => s.id === subscription.id)[0];
      if (subscription) {
        return service.getSubscriptions().then(subs => getSubs(subs));
      }
    };

    return Alerts.confirm(msg, {
      action: 'CANCEL_TRADE',
      cancel: 'GO_BACK'
    }).then(() => trade.cancel())
      .then(() => Exchange.fetchExchangeData(service.exchange))
      .then(() => checkForSubAndFetch())
      .catch((e) => {
        if (e !== 'cancelled' && e !== 'escape key press' && e !== 'backdrop click') {
          Alerts.displayError('ERROR_TRADE_CANCEL');
        }
      });
  };

  service.getSubscriptions = () => {
    return service.exchange.getSubscriptions();
  };

  service.cancelSubscription = (id) => {
    return service.exchange.cancelSubscription(id);
  };

  service.getPendingKYC = () => {
    return service.kycs[0] && service.tradeStateIn(service.states.pending)(service.kycs[0]) && service.kycs[0];
  };

  service.getRejectedKYC = () => {
    return service.kycs[0] && service.tradeStateIn(service.states.error)(service.kycs[0]) && service.kycs[0];
  };

  service.getOpenKYC = () => {
    return service.kycs.length && service.getPendingKYC() ? service.getPendingKYC() : service.exchange.triggerKYC();
  };

  service.openPendingKYC = () => {
    modals.openBuyView(null, service.getOpenKYC());
  };

  service.getPendingTrade = () => {
    let trades = service.exchange.trades;
    return trades.filter((trade) => trade._state === 'awaiting_transfer_in')[0];
  };

  service.getProcessingTrade = () => {
    let trades = service.exchange.trades;
    return trades.filter((trade) => trade._state === 'processing')[0];
  };

  service.openPendingTrade = () => {
    modals.openBuyView(null, service.getPendingTrade());
  };

  service.openProcessingTrade = () => {
    modals.openBuyView(null, service.getProcessingTrade());
  };

  service.openTradingDisabledHelper = () => {
    let canTradeAfter = service.exchange.profile.canTradeAfter;
    let days = isNaN(canTradeAfter) ? 1 : Math.ceil((canTradeAfter - Date.now()) / ONE_DAY_MS);

    modals.openHelper('coinify_after-trade', { days: days });
  };

  service.pollUserLevel = () => {
    let kyc = service.getPendingKYC();
    let success = () => { Exchange.fetchProfile(service.exchange); Alerts.displaySuccess('KYC_APPROVED'); };

    kyc && Exchange.pollUserLevel(() => kyc && kyc.refresh(), () => kyc.state === 'completed', success);
  };

  service.signupForAccess = (email, country, state) => {
    BrowserHelper.safeWindowOpen('https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + country + '&entry.387129390=' + state);
  };

  service.incrementBuyDropoff = (step) => {
    MyBlockchainApi.incrementBuyDropoff(step);
  };

  service.getNextRecurringTrade = () => {
    if (!service.subscriptions) return false;
    let activeSub = service.subscriptions && service.subscriptions.filter(s => s.isActive);
    if (activeSub.length) {
      let matchingTrades = service.trades.filter(t => t.tradeSubscriptionId === activeSub[0].id);
      let trade = matchingTrades.sort((a, b) => a.createdAt < b.createdAt);
      const fee = (trade[0].sendAmount / 100) - (trade[0].inAmount / 100);
      return {amount: trade[0].inAmount / 100,
              currency: trade[0].inCurrency,
              date: trade[0].createdAt,
              frequency: activeSub[0].frequency,
              fee: fee.toFixed(2)};
    }
    return false;
  };

  service.showRecurringBuy = (env) => {
    if (!service.exchange.profile.email) return false;

    const showFlag = env.partners.coinify.showRecurringBuy;
    const allowedCountry = MyWallet.wallet.accountInfo.countryCodeGuess !== 'UK';
    const needsKYC = service.exchange.profile.level && +service.exchange.profile.level.name < 2;

    if (!needsKYC && !service.needsMoreTradesForRecurring && !service.exchange.profile.tradeSubscriptionsAllowed) return false;
    return showFlag && allowedCountry;
  };

  return service;
}
