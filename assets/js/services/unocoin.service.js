angular
  .module('walletApp')
  .factory('unocoin', unocoin);

function unocoin ($q, Alerts, modals, Env, Exchange, MyWallet, $uibModalStack) {
  const service = {
    get exchange () {
      return MyWallet.wallet.external.unocoin;
    },
    get userCanTrade () {
      return !service.getPendingTrade();
    },
    get buyReason () {
      let reason;

      if (!service.userCanTrade) reason = 'awaiting_trade_completion';
      else reason = 'user_can_trade';

      return reason;
    },
    get profile () {
      return service.exchange.profile;
    },
    get buyLaunchOptions () {
      let reason = service.buyReason;

      if (reason === 'awaiting_trade_completion') return { 'FINISH': service.openPendingTrade };
    },
    buy,
    init,
    buying,
    getTxMethod,
    determineStep,
    getPendingTrade,
    openPendingTrade,
    verificationRequired,
    pollLevel
  };

  angular.extend(service, Exchange);

  function init (unocoin) {
    return Env.then((env) => {
      console.info(
        'Using Unocoin %s environment.',
        env.partners.unocoin.production ? 'production' : 'staging'
      );
      unocoin.api.production = env.partners.unocoin.production;
      service.disabled = env.partners.unocoin.disabled;
      service.disabledReason = env.partners.unocoin.disabledReason;
      if (unocoin.trades) service.watchTrades(unocoin.trades);
      unocoin.monitorPayments();
    });
  }

  function buying () {
    return {
      reason: service.buyReason,
      isDisabled: !service.userCanTrade,
      launchOptions: service.buyLaunchOptions
    };
  }

  function determineStep (exchange = {}) {
    let profile = exchange.profile || service.exchange.profile;
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

  function buy (quote) {
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
    return service.exchange.trades.filter((trade) => trade._state === 'awaiting_reference_number' || trade._state === 'awaiting_transfer_in')[0];
  }

  function openPendingTrade () {
    return modals.openBankTransfer(service.getPendingTrade());
  }

  function pollLevel () {
    let success = () => Exchange.fetchProfile(service.exchange).then(() => $uibModalStack.dismissAll());
    service.profile && Exchange.pollUserLevel(() => Exchange.fetchProfile(service.exchange), () => service.profile.level >= 3, success);
  }

  return service;
}
