angular
  .module('walletApp')
  .controller('SendEthereumController', SendEthereumController);

function SendEthereumController ($scope, $window, $q, currency, Alerts, Ethereum, Wallet, Env, localStorageService) {
  const txTemplate = {
    to: null,
    amount: null,
    amountFiat: null,
    note: null
  };

  let links;
  Env.then((env) => {
    links = env.ethereum.surveyLinks;
    this.isWaitingOnTransaction = Ethereum.isWaitingOnTransaction(env.ethereum.lastTxFuse);
  });

  this.account = Ethereum.defaultAccount;
  this.payment = this.account.createPayment();

  Ethereum.fetchFees().then((fees) => {
    this.payment.setGasPrice(fees.regular);
    this.payment.setGasLimit(fees.gasLimit);
  });

  this.fiat = Wallet.settings.currency;

  this.refreshTx = () => {
    this.tx = angular.copy(txTemplate);
  };

  this.setSweep = () => {
    this.payment.setSweep();
    this.tx.amount = this.payment.amount;
    this.tx.amountFiat = parseFloat(this.convertFromEther(this.tx.amount));
  };

  this.onScan = (result) => {
    let cleaned = result.replace(/ethereum:/, '');
    if (Ethereum.isAddress(cleaned)) {
      this.tx.to = cleaned;
      this.setTo();
    } else {
      throw new Error('ETHER_ADDRESS_INVALID');
    }
  };

  this.setTo = () => {
    let { to } = this.tx;
    if (to) this.payment.setTo(to);
  };

  this.setAmount = () => {
    let { amount } = this.tx;
    if (amount) {
      this.tx.amountFiat = parseFloat(this.convertFromEther(amount));
      this.payment.setValue(amount);
    } else {
      this.tx.amountFiat = null;
    }
  };

  this.setAmountFiat = () => {
    let { amountFiat } = this.tx;
    if (amountFiat) {
      this.tx.amount = currency.convertToEther(amountFiat, this.fiat);
      this.payment.setValue(this.tx.amount);
    } else {
      this.tx.amount = null;
    }
  };

  this.nextStep = () => {
    this.transaction = Object.assign(this.payment, this.account, this.transaction);
    this.transaction.note = this.tx.note;
    this.transaction.to = this.tx.to;
    $scope.vm.toConfirmView();
  };

  this.send = () => {
    Wallet.askForSecondPasswordIfNeeded().then(secPass => {
      let privateKey = Ethereum.getPrivateKeyForAccount(Ethereum.defaultAccount, secPass);
      this.payment.sign(privateKey);
      return this.payment.publish();
    }, () => {
      return $q.reject({ message: 'SECOND_PASSWORD_CANCEL' });
    }).then(({ txHash }) => {
      $scope.vm.close();
      this.account.fetchBalance();
      console.log('sent ether:', txHash);
      Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS');
      Ethereum.recordLastTransaction(txHash);
      if (this.tx.note) Ethereum.setTxNote(txHash, this.tx.note);
      if (!localStorageService.get('ethereum-survey')) Alerts.surveyCloseConfirm('ethereum-survey', links, 0);
    }).catch(({ message }) => {
      Alerts.displayError(message);
    });
  };

  this.convertFromEther = (eth) => {
    return currency.formatCurrencyForView(currency.convertFromEther(eth, this.fiat), this.fiat, false);
  };

  this.refreshTx();

  this.account.fetchBalance();
  window.ctrl = this;
}
