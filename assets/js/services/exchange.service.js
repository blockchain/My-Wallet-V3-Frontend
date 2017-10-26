angular
  .module('walletApp')
  .factory('Exchange', Exchange);

function Exchange ($q, Alerts, MyWalletHelpers, modals, Env) {
  const watching = {};

  const service = {
    interpretError,
    displayError,
    fetchProfile,
    fetchExchangeData,
    pollUserLevel,
    fetchSellQuote,
    setSellMax,
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

  function fetchProfile (exchange) {
    return $q.resolve(exchange.fetchProfile());
  }

  function fetchExchangeData (exchange) {
    return $q.resolve(service.fetchProfile(exchange))
      .then(() => exchange.getTrades())
      .then((trades) => service.trades = trades)
      .then(service.watchTrades);
  }

  function fetchQuote (exchange, amount, baseCurr, quoteCurr) {
    let quoteP = exchange.getBuyQuote(amount, baseCurr, quoteCurr);
    return $q.resolve(quoteP);
  }

  function fetchSellQuote (exchange, amount, baseCurr, quoteCurr) {
    let quoteP = exchange.getSellQuote(amount, baseCurr, quoteCurr);
    return $q.resolve(quoteP);
  }

  function setSellMax (balance) {
    service.sellMax = balance.amount / 1e8; service.sellFee = balance.fee;
  }

  function watchTrades (trades) {
    trades
      .filter(t => !t.bitcoinReceived && !watching[t.receiveAddress])
      .forEach(service.watchTrade);
  }

  function pollUserLevel (action, test, successCallback) {
    let exit = () => { stop(); successCallback(); };
    let check = () => action().then(() => test() && exit());
    let stop = MyWalletHelpers.exponentialBackoff(check, 30000);
  }

  function watchTrade (trade) {
    watching[trade.receiveAddress] = true;
    $q.resolve(trade.watchAddress())
      .then(() => trade.refresh())
      .then(() => { modals.openTradeSummary(trade, 'success'); });
  }
}
