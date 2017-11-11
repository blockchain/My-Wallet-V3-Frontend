angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q, MyWallet, Alerts, modals, Env, Exchange, currency) {
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
    get verificationStatus () {
      return service.profile.verificationStatus;
    },
    get requiredDocs () {
      return service.verificationStatus.required_docs;
    },
    get verified () {
      let { level } = service.verificationStatus;
      return level === 'verified' || level === 'pending' && service.requiredDocs.length === 0;
    },
    // TODO: SFOX needs access to the sell exchange rate
    get balanceAboveMin () {
      return Exchange.sellMax > 0;
    },
    get userCanSell () {
      return service.profile && service.verified && service.balanceAboveMin;
    },
    get sellReason () {
      let reason;
      if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else if (!service.verified) reason = 'needs_verification';
      else if (!service.profile) reason = 'needs_account';
      else reason = 'can_sell';
      return reason;
    },
    buy,
    sell,
    init,
    selling,
    determineStep,
    sellTradeDetails
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
      service.disabled = env.partners.sfox.disabled;
      service.disabledReason = env.partners.sfox.disabledReason;
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
      if (!didVerify) {
        return 'verify';
      } else {
        return 'link';
      }
    }
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

  function sellTradeDetails (quote, payment, trade, tx) {
    let { formatCurrencyForView, convertFromSatoshi } = currency;
    let fiat = currency.currencies.find((curr) => curr.code === 'USD');
    let btc = currency.bitCurrencies.find((curr) => curr.code === 'BTC');

    let amount = payment ? payment.amounts[0] : -tx.amount;
    let fee = payment ? payment.finalFee : tx.fee;
    let totalAmount = amount + fee;

    let toBeReceived = quote
                       ? quote.baseCurrency === 'BTC' ? quote.quoteAmount : quote.baseAmount
                       : trade.inAmount;

    return {
      txAmt: {
        key: '.AMT',
        val: formatCurrencyForView(convertFromSatoshi(amount, btc), btc, true)
      },
      txFee: {
        key: '.TX_FEE',
        val: formatCurrencyForView(convertFromSatoshi(fee, btc), btc, true)
      },
      out: {
        key: '.TOTAL',
        val: formatCurrencyForView(convertFromSatoshi(totalAmount, btc), btc, true)
      },
      in: {
        key: '.TO_BE_RECEIVED',
        val: formatCurrencyForView(toBeReceived, fiat, true),
        tip: () => console.log('Clicked tooltip')
      }
    };
  }

  return service;
}
