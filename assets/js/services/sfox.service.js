angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q, MyWallet, Alerts, modals, Env, Exchange, currency, localStorageService, BrowserHelper) {
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
      else if (!service.min) reason = 'needs_exchange_rate_data';
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
    setSellMin,
    dismissSellIntro,
    hasDismissedSellIntro,
    signupForBuyAccess,
    signupForSellAccess
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

  function dismissSellIntro () {
    localStorageService.set('hasSeenSfoxSellIntro', true);
  }

  function hasDismissedSellIntro () {
    return localStorageService.get('hasSeenSfoxSellIntro');
  }

  function sellTradeDetails (quote, payment, trade, tx) {
    let { formatCurrencyForView, convertFromSatoshi } = currency;
    let fiat = currency.currencies.find((curr) => curr.code === 'USD');
    let btc = currency.bitCurrencies.find((curr) => curr.code === 'BTC');

    let fee = payment ? payment.finalFee : tx.fee;
    let amount = payment ? payment.amounts[0] : Math.abs(tx.amount) - fee;
    let tradingFee = quote ? parseFloat(quote.feeAmount).toFixed(2) : parseFloat(trade.feeAmount).toFixed(2);
    let totalAmount = payment ? amount + fee : Math.abs(tx.amount);
    let toBeReceived = quote
                       ? quote.baseCurrency === 'BTC' ? (quote.quoteAmount - tradingFee).toFixed(2) : (quote.baseAmount - tradingFee).toFixed(2)
                       : (trade.receiveAmount).toFixed(2);
    let amountKey = quote || payment ? '.AMT' : '.AMT_SOLD';

    return {
      txAmt: {
        key: amountKey,
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
      sfoxFee: {
        key: '.TRADING_FEE',
        val: formatCurrencyForView(tradingFee, fiat, true)
      },
      in: {
        key: '.TO_BE_RECEIVED',
        val: formatCurrencyForView(toBeReceived, fiat, true),
        tip: () => console.log('Clicked tooltip')
      }
    };
  }

  function signupForBuyAccess (email, state) {
    BrowserHelper.safeWindowOpen(`https://docs.google.com/forms/d/e/1FAIpQLSdpnz-DBaeq3ZFx9rAMaJBWASFYNXnVS_g_5C6EmamZBcOxPA/viewform?entry.1192956638=${email}`);
  }

  function signupForSellAccess (email, state) {
    BrowserHelper.safeWindowOpen(`https://docs.google.com/forms/d/e/1FAIpQLSeBjqWrqNs5k-yAR8p35xBwZ_FfwWfjttL0WCf4Qa2Ev2CK8A/viewform?entry.1192956638=${email}&entry.387129390=${state}`);
  }

  return service;
}
