angular
  .module('walletApp')
  .controller('SendEthereumController', SendEthereumController);

function SendEthereumController ($scope, Ethereum) {
  const txTemplate = {
    to: null,
    amount: null,
    description: null,
    fee: 20,
    gasLimit: null,
    gasPrice: null
  };

  this.account = Ethereum.defaultAccount;
  this.payment = this.account.createPayment();
  this.payment.setGasPrice(20);

  this.refreshTx = () => {
    this.tx = angular.copy(txTemplate);
  };

  this.setSweep = () => {
    // TODO: implement sweep
    console.log('setting sweep');
  };

  this.isAddress = (address) => {
    return Ethereum.isAddress(address);
  };

  this.onScan = (result) => {
    if (this.isAddress(result)) {
      this.tx.to = result;
    }
  };

  this.setAmount = () => {
    let { amount } = this.tx;
    this.payment.setValue(amount);
  };

  this.nextStep = () => {
    this.payment.sign();
    $scope.vm.toConfirmView();
  };

  this.send = () => {
    this.payment.publish().then(() => {
      console.log('success');
    });
  };

  this.refreshTx();

  this.account.fetchBalance().then(() => {
    this.maxAvailable = parseFloat(this.account.balance);
  });

  window.ctrl = this;
}
