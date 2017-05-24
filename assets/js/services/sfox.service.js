angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q, Alerts, modals, Env) {
  const watching = {};

  const service = {
    init,
    interpretError,
    displayError,
    determineStep,
    fetchExchangeData,
    fetchQuote,
    buy,
    watchTrades,
    watchTrade
  };

  return service;

  function init (sfox) {
    console.info(
      'Using SFOX %s Environment with API key %s, Plaid Environment %s and Sift Science key %s.',
      Env.partners.sfox.production ? 'production' : 'staging',
      Env.partners.sfox.apiKey,
      Env.partners.sfox.plaidEnv,
      Env.partners.sfox.siftScience
    );
    sfox.api.production = Env.partners.sfox.production;
    sfox.api.apiKey = Env.partners.sfox.apiKey;
    if (sfox.trades) service.watchTrades(sfox.trades);
    sfox.monitorPayments();
  }

  function interpretError (error) {
    if (angular.isString(error)) {
      try {
        error = JSON.parse(error).error;
      } catch (e) {
      }
    } else {
      error = error.error || error.message || error.initial_error || error;
    }
    return error;
  }

  function displayError (error) {
    Alerts.displayError(service.interpretError(error));
  }

  function determineStep (exchange, accounts) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      let { level, required_docs = [] } = profile.verificationStatus;
      let didVerify = (level === 'verified') || (level === 'pending' && required_docs.length === 0);
      let hasAccount = accounts.length && accounts[0].status === 'active';
      if (!didVerify) {
        return 'verify';
      } else if (!hasAccount) {
        return 'link';
      } else {
        return 'buy';
      }
    }
  }

  function fetchExchangeData (exchange) {
    return $q.resolve(exchange.fetchProfile())
      .then(() => exchange.getTrades())
      .then(service.watchTrades);
  }

  function fetchQuote (exchange, amount, baseCurr, quoteCurr) {
    let quoteP = exchange.getBuyQuote(amount, baseCurr, quoteCurr);
    return $q.resolve(quoteP);
  }

  function buy (account, quote) {
    return $q.resolve(quote.getPaymentMediums())
      .then(mediums => mediums.ach.buy(account));
  }

  function watchTrades (trades) {
    trades
      .filter(t => !t.bitcoinReceived && !watching[t.receiveAddress])
      .forEach(service.watchTrade);
  }

  function watchTrade (trade) {
    watching[trade.receiveAddress] = true;
    $q.resolve(trade.watchAddress())
      .then(() => trade.refresh())
      .then(() => { modals.openTradeSummary(trade, 'success'); });
  }
}
