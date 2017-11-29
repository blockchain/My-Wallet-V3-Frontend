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
    get accounts () {
      return service._accounts || [];
    },
    set accounts (val) {
      service._accounts = val;
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
    get activeAccount () {
      return service.accounts[0] && service.accounts[0].status === 'active';
    },
    get balanceAboveMin () {
      return Exchange.sellMax > service.min;
    },
    get userCanSell () {
      return service.profile && service.verified && service.activeAccount && service.balanceAboveMin;
    },
    get sellReason () {
      let reason;
      if (!service.profile) reason = 'needs_account';
      else if (!service.verified) reason = 'needs_id';
      else if (!service.accounts.length) reason = 'needs_bank';
      else if (!service.activeAccount) reason = 'needs_bank_active';
      else if (!service.balanceAboveMin) reason = 'not_enough_funds_to_sell';
      else reason = 'can_sell';
      return reason;
    },
    buy,
    sell,
    init,
    selling,
    determineStep,
    sellTradeDetails,
    setSellMin
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

  function setSellMin (min) {
    service.min = min;
  }

  function determineStep (exchange, accounts) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      if (!service.verified) {
        if (!service.profile.setupComplete) {
          return 'verify';
        } else {
          return 'upload';
        }
      } else {
        return 'link';
      }
    }
  }

  function selling () {
    return {
      reason: service.sellReason,
      isDisabled: !service.userCanSell,
      launchOptions: service.sellLaunchOptions,
      verificationRequired: !service.activeAccount
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

    let amount = payment ? payment.amounts[0] : tx.amount;
    let fee = payment ? payment.finalFee : tx.fee;
    let totalAmount = amount + fee;

    let toBeReceived = quote
                       ? quote.baseCurrency === 'BTC' ? quote.quoteAmount : quote.baseAmount
                       : trade.receiveAmount;

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
