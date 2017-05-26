angular
  .module('walletApp')
  .factory('unocoin', unocoin);

function unocoin ($q, Alerts, modals, Options, Env) {
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

  function init (unocoin) {
    return Env.then((env) => {
      return Options.get().then(options => {
        if (unocoin.trades) service.watchTrades(unocoin.trades);
        unocoin.monitorPayments();
      });
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
      if (!profile.complete) {
        return 'verify';
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
    let quoteP = exchange.getBuyQuote(-amount, baseCurr, quoteCurr);
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
