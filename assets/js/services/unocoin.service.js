angular
  .module('walletApp')
  .factory('unocoin', unocoin);

function unocoin ($q, Alerts, modals, Env, Exchange) {
  const service = {
    buy,
    init,
    getTxMethod,
    determineStep,
    verificationRequired
  };

  angular.extend(service, Exchange);

  function init (unocoin) {
    return Env.then((env) => {
      console.info(
        'Using Unocoin %s environment.',
        env.partners.unocoin.production ? 'production' : 'staging'
      );
      unocoin.api.production = env.partners.unocoin.production;
      if (unocoin.trades) service.watchTrades(unocoin.trades);
      unocoin.monitorPayments();
    });
  }

  function determineStep (exchange) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      if (service.verificationRequired(profile)) {
        if (profile.identityComplete && profile.bankInfoComplete) {
          return 'upload';
        } else {
          return 'verify';
        }
      } else {
        return 'pending';
      }
    }
  }

  function buy (account, quote) {
    return $q.resolve(quote.getPaymentMediums())
             .then(mediums => mediums.bank.buy());
  }

  function getTxMethod (unocoin, hash) {
    let trade = unocoin.trades.filter((t) => t.txHash === hash)[0];
    return trade && (trade.isBuy ? 'buy' : 'sell');
  }

  function verificationRequired (profile) {
    return profile.level < 2;
  }

  return service;
}
