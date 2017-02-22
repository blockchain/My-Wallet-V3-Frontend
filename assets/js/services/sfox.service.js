angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($rootScope, $q, Alerts, modals, Options) {
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
    return Options.get().then(options => {
      sfox.api.production = $rootScope.sfoxUseStaging === null ? $rootScope.isProduction : !Boolean($rootScope.sfoxUseStaging);
      sfox.api.apiKey = $rootScope.sfoxApiKey || options.partners.sfox.apiKey;
      if (sfox.trades) service.watchTrades(sfox.trades);
      sfox.monitorPayments();
    });
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
