angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q, MyWallet, MyWalletHelpers, Alerts, modals, Env, Exchange, currency, localStorageService, BrowserHelper) {
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
    get hasSeen () {
      return localStorageService.get('sfox-has-seen');
    },
    get hasSeenBuy () {
      return localStorageService.get('sfox-has-seen-buy');
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
    get balanceAboveSellMin () {
      return Exchange.sellMax > service.min;
    },
    get userCanSell () {
      return service.profile && service.verified && service.activeAccount && service.balanceAboveSellMin;
    },
    get userCanBuy () {
      return service.profile && service.verified && service.activeAccount;
    },
    get sellReason () {
      let reason;
      if (!service.profile) reason = 'needs_account';
      else if (!service.verified) reason = 'needs_id';
      else if (!service.accounts.length) reason = 'needs_bank';
      else if (!service.activeAccount) reason = 'needs_bank_active';
      else if (!service.min || isNaN(Exchange.sellMax)) reason = 'needs_data';
      else if (!service.balanceAboveSellMin) reason = 'not_enough_funds_to_sell';
      else reason = 'can_sell_remaining_balance';
      return reason;
    },
    get buyReason () {
      let reason;
      if (!service.profile) reason = 'needs_account';
      else if (!service.verified) reason = 'needs_id';
      else if (!service.accounts.length) reason = 'needs_bank';
      else if (!service.activeAccount) reason = 'needs_bank_active';
      else if (!service.min) reason = 'needs_data';
      else reason = 'has_remaining_buy_limit';
      return reason;
    },
    get sellLaunchOptions () {
      let reason = service.sellReason;

      if (reason === 'not_enough_funds_to_sell') return { 'REQUEST': modals.openRequest };
    },
    buy,
    sell,
    init,
    selling,
    buying,
    determineStep,
    sellTradeDetails,
    buyTradeDetails,
    setHasSeen,
    setHasSeenBuy,
    setSellMin,
    showAnnouncement,
    showBuyAnnouncement,
    dismissSellIntro,
    hasDismissedSellIntro,
    dismissBuyIntro,
    hasDismissedBuyIntro,
    signupForBuyAccess,
    signupForSellAccess,
    getTxMethod,
    fetchTrades
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

  function setHasSeen () {
    localStorageService.set('sfox-has-seen', true);
  }

  function setHasSeenBuy () {
    localStorageService.set('sfox-has-seen-buy', true);
  }

  function showAnnouncement (canTrade, isSFOXCountryState) {
    return canTrade && isSFOXCountryState && MyWallet.wallet.hdwallet.defaultAccount.balance > 0;
  }

  function showBuyAnnouncement (canTrade, isSFOXCountryState, fraction) {
    let email = MyWallet.wallet.accountInfo.email;
    return canTrade && isSFOXCountryState && MyWalletHelpers.isStringHashInFraction(email, fraction);
  }

  function determineStep (exchange) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      if (!service.verified) {
        if (!service.profile.setupComplete && !service.requiredDocs.length) return 'verify';
        else if (service.requiredDocs.length) return 'upload';
        else return 'link';
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
      verificationRequired: !service.verified || !service.activeAccount
    };
  }

  function buying () {
    return {
      reason: service.buyReason,
      isDisabled: !service.userCanBuy,
      verificationRequired: !service.verified || !service.activeAccount
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

  function dismissBuyIntro () {
    localStorageService.set('hasSeenSfoxBuyIntro', true);
  }

  function hasDismissedBuyIntro () {
    return localStorageService.get('hasSeenSfoxBuyIntro');
  }

  function sellTradeDetails (quote, payment, trade, tx, expectedDelivery) {
    let { formatCurrencyForView, convertFromSatoshi } = currency;
    let fiat = currency.currencies.find((curr) => curr.code === 'USD');
    let btc = currency.bitCurrencies.find((curr) => curr.code === 'BTC');

    let fee = payment ? payment.finalFee : tx ? tx.fee : 'Error: Please Refresh the Wallet';
    let amount = payment ? payment.amounts[0] : tx ? Math.abs(tx.amount) - fee : 'Error: Please Refresh the Wallet';
    let tradingFee = quote ? parseFloat(quote.feeAmount).toFixed(2) : parseFloat(trade.feeAmount).toFixed(2);
    let totalAmount = payment ? amount + fee : tx ? Math.abs(tx.amount) : 'Error: Please Refresh the Wallet';
    let toBeReceived = quote
                       ? quote.baseCurrency === 'BTC' ? parseFloat(quote.quoteAmount).toFixed(2) : parseFloat(quote.baseAmount).toFixed(2)
                       : (trade.receiveAmount).toFixed(2);
    let amountKey = quote || payment ? '.AMT' : '.AMT_SOLD';

    let details = {
      txAmt: {
        key: amountKey,
        val: isNaN(amount) ? amount : formatCurrencyForView(convertFromSatoshi(amount, btc), btc, true)
      },
      txFee: {
        key: '.TX_FEE',
        val: isNaN(fee) ? fee : formatCurrencyForView(convertFromSatoshi(fee, btc), btc, true)
      },
      out: {
        key: '.TOTAL',
        val: isNaN(totalAmount) ? fee : formatCurrencyForView(convertFromSatoshi(totalAmount, btc), btc, true)
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

    if (expectedDelivery) {
      details.expectedDelivery = {
        key: '.EXPECTED_DELIVERY',
        val: expectedDelivery
      };
    }

    return details;
  }

  function buyTradeDetails (quote, trade, tx, expectedDelivery) {
    let buyTxFee;
    return Env.then(env => {
      buyTxFee = env.partners.sfox.buyTransactionFeeInSatoshi;
      let { formatCurrencyForView, convertFromSatoshi } = currency;
      let fiat = currency.currencies.find((curr) => curr.code === 'USD');
      let btc = currency.bitCurrencies.find((curr) => curr.code === 'BTC');
      let fee = buyTxFee;
      let fiatFee = currency.convertFromSatoshi(fee, fiat);
      let amount = quote
                      ? quote.baseCurrency === 'USD' ? quote.quoteAmount : quote.baseAmount
                      : trade.receiveAmount * 1e8;

      let tradingFee = quote ? parseFloat(quote.feeAmount) : parseFloat(trade.feeAmount);
      let fiatAmount = quote
                        ? quote.baseCurrency === 'USD' ? quote.baseAmount - tradingFee : quote.quoteAmount - tradingFee
                        : trade.inAmount / 1e8 - trade.feeAmount;

      let toBeSpent = quote
                         ? quote.baseCurrency === 'BTC' ? (+quote.quoteAmount) : (+quote.baseAmount)
                         : (trade.inAmount / 1e8);

      let amountKey = quote ? '.AMT' : '.AMT_BOUGHT';

      let details = {
        txAmt: {
          key: amountKey,
          val: `${formatCurrencyForView(convertFromSatoshi(amount, btc), btc, true)} ($${formatCurrencyForView(fiatAmount.toFixed(2), fiat, true)})`
        },
        sfoxFee: {
          key: '.TRADING_FEE',
          val: formatCurrencyForView(tradingFee.toFixed(2), fiat, true)
        },
        in: {
          key: '.TO_BE_SPENT',
          val: formatCurrencyForView(toBeSpent.toFixed(2), fiat, true),
          tip: () => console.log('Clicked tooltip')
        }
      };

      if (buyTxFee) {
        let totalAmount = tx ? Math.abs(tx.amount) : amount - fee;

        details.txFee = {
          key: '.TX_FEE',
          val: `${formatCurrencyForView(convertFromSatoshi(fee, btc), btc, true)} ($${formatCurrencyForView(fiatFee, fiat, false)})`
        };
        details.out = {
          key: '.TOTAL',
          val: formatCurrencyForView(convertFromSatoshi(totalAmount, btc), btc, true)
        };
      }

      if (expectedDelivery) {
        details.expectedDelivery = {
          key: '.EXPECTED_DELIVERY',
          val: expectedDelivery
        };
      }

      return details;
    });
  }

  function getTxMethod (hash) {
    let trade = service.exchange.trades.filter((t) => t.txHash === hash)[0];
    return trade && (trade.isBuy ? 'buy' : 'sell');
  }

  function signupForBuyAccess (email, state) {
    BrowserHelper.safeWindowOpen(`https://docs.google.com/forms/d/e/1FAIpQLSdpnz-DBaeq3ZFx9rAMaJBWASFYNXnVS_g_5C6EmamZBcOxPA/viewform?entry.1192956638=${email}`);
  }

  function signupForSellAccess (email, state) {
    BrowserHelper.safeWindowOpen(`https://docs.google.com/forms/d/e/1FAIpQLSeBjqWrqNs5k-yAR8p35xBwZ_FfwWfjttL0WCf4Qa2Ev2CK8A/viewform?entry.1192956638=${email}&entry.387129390=${state}`);
  }

  function fetchTrades () {
    return service.exchange.getTrades();
  }

  return service;
}
