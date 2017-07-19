angular
  .module('walletApp')
  .controller('SendEthereumController', SendEthereumController);

function SendEthereumController ($scope, $window, currency, Alerts, Ethereum, Wallet, Env) {
  const txTemplate = {
    to: null,
    amount: null,
    amountFiat: null,
    description: null
  };

  this.account = Ethereum.defaultAccount;
  this.payment = this.account.createPayment();

  Env.then(({ ethereum = {} }) => {
    let { gasPrice, gasLimit } = ethereum;
    this.payment.setGasPrice(gasPrice || Ethereum.defaults.GAS_PRICE);
    this.payment.setGasLimit(gasLimit || Ethereum.defaults.GAS_LIMIT);
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
    if (Ethereum.isAddress(result)) {
      this.tx.to = result;
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
    this.payment.sign();
    $scope.vm.toConfirmView();
  };

  this.send = () => {
    this.payment.publish().then(({ txHash }) => {
      $scope.vm.close();
      this.account.fetchBalance();
      console.log('sent ether:', txHash);
      Alerts.displaySuccess('Successfully sent Ether!').then(() => {
        let win = $window.open(`https://etherscan.io/tx/${txHash}`, '__blank');
        win.opener = null;
      });
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
