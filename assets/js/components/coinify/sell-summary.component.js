angular
  .module('walletApp')
  .component('sellSummary', {
    bindings: {
      transaction: '<',
      sellTrade: '<',
      totalBalance: '<',
      payment: '<',
      bankAccount: '<',
      onComplete: '&',
      close: '&',
      dismiss: '&',
      onSuccess: '&',
      quote: '<'
    },
    templateUrl: 'partials/coinify/sell-summary.pug',
    controller: CoinifySellSummaryController,
    controllerAs: '$ctrl'
  });

function CoinifySellSummaryController ($q, Wallet, currency, Alerts, $timeout) {
  this.sellRateForm;

  this.insufficientFunds = () => {
    const tx = this.transaction;
    const combined = tx.btc + tx.fee.btc;
    if (combined > this.totalBalance) {
      return true;
    }
  };

  this.isDisabled = () => {
    if (!this.fields) true;
    if (this.insufficientFunds() === true || !this.sellRateForm.$valid) return true;
    if (this.sellTrade) {
      if (!this.sellTrade.quote) true;
    }
  };

  this.checkForUpdatedQuote = () => {
    let updated = new Date(this.quote.expiresAt).getTime();
    let original = new Date(this.bankAccount.quote.expiresAt).getTime();
    if ((updated && original) && (updated > original)) {
      this.bankAccount.updateQuote(this.quote);
    }
  };

  this.checkForUpdatedQuote();

  // ---- for making a sell trade ---- //

  const handleBadRequest = (e) => {
    if (e instanceof SyntaxError) {
      this.onComplete();
    } else {
      this.error = JSON.parse(e);
    }
  };

  const transactionFailed = (message) => {
    let msgText = typeof message === 'string' ? message : 'SEND_FAILED';
    if (msgText.indexOf('Fee is too low') > -1) msgText = 'LOW_FEE_ERROR';

    Alerts.displayError(msgText, false, this.alerts);
  };

  const transactionSucceeded = (tx) => {
    $timeout(() => {
      Wallet.beep();
      let message = 'BITCOIN_SENT';
      Alerts.displaySentBitcoin(message);
      let note = `Coinify Sell Order ${this.sellResult.id}`;
      if (note !== '') Wallet.setNote({ hash: tx.txid }, note);
      this.waiting = false;
      this.onComplete();
    }, 500);
  };

  const setCheckpoint = (payment) => this.paymentCheckpoint = payment;

  const signAndPublish = (passphrase) => {
    return this.payment.sideEffect(setCheckpoint)
      .sign(passphrase).publish().payment;
  };

  const assignAndBuildPayment = (sellResult) => {
    let amount = currency.convertToSatoshi(sellResult.transferIn.sendAmount, currency.bitCurrencies[0]);
    this.payment.to(sellResult.transferIn.details.account);
    this.payment.amount(amount);
    this.payment.build();
  };

  const handleError = (e) => {
    console.error('error publishing', e.error);
    console.log(JSON.stringify(e.payment, null, 2));
    if (e.error.message) console.error(e.error.message);
    transactionFailed(e);
  };

  const handleSellResult = (sellResult) => {
    if (!sellResult.transferIn) {
      this.error = sellResult;
      this.error = JSON.parse(this.error);
    } else {
      this.sellResult = sellResult;
      this.onSuccess({trade: sellResult});
      assignAndBuildPayment(sellResult);
    }
    return sellResult;
  };
  this.sell = () => {
    this.waiting = true;
    $q.resolve(this.bankAccount.sell())
      .then(handleSellResult)
      .then(() => {
        Wallet.askForSecondPasswordIfNeeded()
          .then(signAndPublish)
          .then(transactionSucceeded)
          .catch(handleError);

        // undo these comments when sending btc is disabled
        // this.waiting = false;
        // this.onComplete();
      })
      .catch(handleBadRequest);
  };
}
