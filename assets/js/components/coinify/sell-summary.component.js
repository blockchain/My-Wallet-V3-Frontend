angular
  .module('walletApp')
  .component('sellSummary', {
    bindings: {
      transaction: '<',
      fields: '<',
      sellTrade: '<',
      totalBalance: '<',
      error: '<',
      waiting: '<',
      isSweepTransaction: '<',
      payment: '<',
      paymentAccount: '<',
      bankId: '<',
      onComplete: '&',
      sell: '&',
      close: '&',
      dismiss: '&',
      onSuccess: '&'
    },
    templateUrl: 'partials/coinify/sell-summary.pug',
    controller: CoinifySellSummaryController,
    controllerAs: '$ctrl'
  });

function CoinifySellSummaryController ($scope, $q, buySell, Wallet, currency, Alerts, $timeout) {
  console.log('summary component', this);
  // this.$onInit = () => this.startPayment();

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

  this.status = {};

  // ---- for making a sell trade ---- //

  const handleSellResult = (sellResult) => {
    if (!sellResult.transferIn) {
      this.error = sellResult;
      this.error = JSON.parse(this.error);
    } else {
      this.onSuccess({trade: sellResult});
    }
  };

  const handleBadRequest = (e) => this.error = JSON.parse(e);

  const transactionFailed = (message) => {
    let msgText = typeof message === 'string' ? message : 'SEND_FAILED';
    if (msgText.indexOf('Fee is too low') > -1) msgText = 'LOW_FEE_ERROR';

    if (msgText.indexOf('Transaction Already Exists') > -1) {
      $uibModalInstance.close();
    } else {
      Alerts.displayError(msgText, false, this.alerts);
    }
  };

  const transactionSucceeded = (tx) => {
    $timeout(() => {
      Wallet.beep();
      let message = 'BITCOIN_SENT';
      Alerts.displaySentBitcoin(message);
      let note = `Coinify Sell Order ${this.sellResult.id}`;
      if (note !== '') Wallet.setNote({ hash: tx.txid }, note);
    }, 500);
  };

  const setCheckpoint = (payment) => {
    this.paymentCheckpoint = payment;
  };

  const signAndPublish = (passphrase) => {
    return this.payment.sideEffect(setCheckpoint)
      .sign(passphrase).publish().payment;
  };

  const assignAndBuildPayment = () => {
    this.payment.to(this.sellResult.transferIn.details.account);
    this.payment.amount(this.sellResult.transferIn.sendAmount * 100000000);
    this.payment.build();
  };

  const handleError = (e) => {
    console.error('error publishing', e.error);
    console.log(JSON.stringify(e.payment, null, 2));
    if (e.error.message) console.error(e.error.message);
    transactionFailed(e);
  };

  this.sell = () => {
    this.waiting = true;
    this.paymentAccount.sell(this.bankId)
      .then(sellResult => {
        console.log('sellResult', sellResult);
        handleSellResult(sellResult);
        this.sellResult = sellResult;
        return sellResult;
      })
      .then(sellData => {
        if (this.error) return;
        assignAndBuildPayment();
        console.log('payment built', this);

        // Wallet.askForSecondPasswordIfNeeded()
        //   .then(signAndPublish)
        //   .then(transactionSucceeded)
        //   .catch(handleError);

        this.waiting = false;
        this.onComplete();
      })
      .catch(handleBadRequest);
  };
}
