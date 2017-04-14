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
  console.log('summary component', this)
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
      console.log('set error', sellResult);
      this.error = sellResult;
      this.error = JSON.parse(this.error);
    } else {
      this.onSellSuccess({trade: sellResult});
      // $scope.sellTrade = sellResult;
      // $scope.sendAddress = sellResult.transferIn.details.account;
      // $scope.sendAmount = sellResult.transferIn.sendAmount * 100000000;
      // $scope.formatBankInfo(sellResult);
    }
  };

  const transactionFailed = (message) => {
    let msgText = typeof message === 'string' ? message : 'SEND_FAILED';
    if (msgText.indexOf('Fee is too low') > -1) msgText = 'LOW_FEE_ERROR';

    if (msgText.indexOf('Transaction Already Exists') > -1) {
      $uibModalInstance.close();
    } else {
      Alerts.displayError(msgText, false, $scope.alerts);
    }
  };

  const transactionSucceeded = (tx) => {
    $timeout(() => {
      Wallet.beep();
      let message = 'BITCOIN_SENT';
      Alerts.displaySentBitcoin(message);
      let note = `Coinify Sell Order ${$scope.sellTrade.id}`;
      if (note !== '') Wallet.setNote({ hash: tx.txid }, note);
    }, 500);
  };

  const setCheckpoint = (payment) => {
    $scope.paymentCheckpoint = payment;
  };

  const signAndPublish = (passphrase) => {
    return $scope.payment.sideEffect(setCheckpoint)
      .sign(passphrase).publish().payment;
  };

  const handlePaymentAssignment = () => {
    this.payment.to(this.sellResult.transferIn.details.account);
    this.payment.amount(this.sellResult.transferIn.details.receiveAmount);
  };
  // need to send a bankobj with an id for now
  this.sell = () => {
    this.waiting = true;
    console.log('sell running', this);
    let bank = {id: this.bankId};
    $q.resolve(buySell.createSellTrade(this.sellTrade.quote, bank))
      .then(sellResult => {
        console.log('sellResult', sellResult);
        handleSellResult(sellResult);
        this.sellResult = sellResult;
        return sellResult;
      })
      .then(sellData => {
        if (this.error) return;
        handlePaymentAssignment();
        // for testing
        // if (exchange._customAddress && exchange._customAmount) {
        //   console.log('customAddress and customAmount', exchange._customAddress, exchange._customAmount);
        //   $scope.payment.to(exchange._customAddress);
        //   $scope.payment.amount(exchange._customAmount);
        // }
        this.payment.build();

        // Wallet.askForSecondPasswordIfNeeded()
        //   .then(signAndPublish)
        //   .then(transactionSucceeded)
        //   .catch(err => {
        //     console.log('err when publishing', err);
        //     transactionFailed(err);
        //   });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        this.waiting = false;
        if (!$scope.error) this.goTo('review');
      });
  };
}
