angular
  .module('walletApp')
  .factory('Exchange', Exchange);

function Exchange ($q, Alerts, modals, Env) {
  const watching = {};

  const service = {
    interpretError,
    displayError,
    fetchExchangeData,
    fetchQuote,
    watchTrades,
    watchTrade
  };

  return service;

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

  function fetchExchangeData (exchange) {
    return $q.resolve(exchange.fetchProfile())
      .then(() => exchange.getTrades())
      .then((trades) => service.trades = trades)
      .then(service.watchTrades);
  }

  function fetchQuote (exchange, amount, baseCurr, quoteCurr) {
    let quoteP = exchange.getBuyQuote(amount, baseCurr, quoteCurr);
    return $q.resolve(quoteP);
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
