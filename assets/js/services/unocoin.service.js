angular
  .module('walletApp')
  .factory('unocoin', unocoin);

function unocoin ($q, Alerts, modals, Env, Exchange, MyWallet) {
  const service = {
    get exchange () {
      return MyWallet.wallet.external.unocoin;
    },
    buy,
    init,
    getTxMethod,
    determineStep,
    getPendingTrade,
    openPendingTrade,
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

  function determineStep () {
    let profile = service.exchange.profile;
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

  function getPendingTrade () {
    return service.exchange.trades.filter((trade) => trade._state === 'awaiting_reference_number')[0];
  }

  function openPendingTrade () {
    return modals.openBankTransfer(service.getPendingTrade());
  }

  return service;
}
