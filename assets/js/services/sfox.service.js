angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q, MyWallet, Alerts, modals, Env, Exchange) {
  const service = {
    get exchange () {
      return MyWallet.wallet.external.sfox;
    },
    get profile () {
      return service.exchange.profile;
    },
    get limits () {
      return service.profile.limits;
    },
    // TODO: SFOX needs access to the sell exchange rate
    get balanceAboveMin () {
      return Exchange.sellMax > 0;
    },
    get userCanBuy () {
      return !service.profile || service.profile.canBuy;
    },
    get userCanSell () {
      return service.balanceAboveMin;
    },
    get buyReason () {
      let reason;
      if (!service.profile) reason = 'user_needs_account';
      else reason = 'user_can_buy';
      return reason;
    },
    get sellReason () {
      let reason;
      if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else if (!service.profile) reason = 'user_needs_account';
      else reason = 'user_can_sell';
      return reason;
    },
    buy,
    sell,
    init,
    buying,
    selling,
    determineStep
  };

  angular.extend(service, Exchange);

  function init (sfox) {
    return Env.then((env) => {
      console.info(
        'Using SFOX %s environment with API key %s, Plaid environment %s and Sift Science key %s.',
        env.partners.sfox.production ? 'production' : 'staging',
        env.partners.sfox.apiKey,
        env.partners.sfox.plaidEnv,
        env.partners.sfox.siftScience
      );
      sfox.api.production = env.partners.sfox.production;
      sfox.api.apiKey = env.partners.sfox.apiKey;
      if (sfox.trades) service.watchTrades(sfox.trades);
      sfox.monitorPayments();
    });
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

  function buying () {
    return {
      reason: service.buyReason,
      isDisabled: !service.userCanBuy,
      launchOptions: service.buyLaunchOptions
    };
  }

  function selling () {
    return {
      reason: service.sellReason,
      isDisabled: !service.userCanSell,
      launchOptions: service.sellLaunchOptions
    };
  }

  function buy (account, quote) {
    return $q.resolve(quote.getPaymentMediums())
      .then(mediums => mediums.ach.buy(account));
  }

  function sell (account, quote) {
    return $q.resolve(quote.getPaymentMediums())
      .then(mediums => mediums.ach.sell(account));
  }

  return service;
}
