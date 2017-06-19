angular
  .module('walletApp')
  .factory('unocoin', unocoin);

function unocoin ($q, Alerts, modals, Env, Exchange) {
  const service = {
    buy,
    init,
    determineStep
  };

  angular.extend(service, Exchange);

  function init (unocoin) {
    if (unocoin.trades) service.watchTrades(unocoin.trades);
  }

  function determineStep (exchange, accounts) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      if (profile.level < 2) {
        return 'verify';
      } else {
        return 'pending';
      }
    }
  }

  function buy (account, quote) {
    return $q.resolve(quote.getPaymentMediums())
             .then(mediums => mediums.bank.buy());
  }

  return service;
}
