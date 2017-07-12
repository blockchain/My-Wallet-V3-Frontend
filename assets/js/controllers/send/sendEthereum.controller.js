angular
  .module('walletApp')
  .controller('SendEthereumController', SendEthereumController);

function SendEthereumController ($scope, $window, Alerts, Ethereum) {
  const txTemplate = {
    to: null,
    amount: null,
    description: null
  };

  this.account = Ethereum.defaultAccount;
  this.payment = this.account.createPayment();
  this.payment.setGasPrice(10);

  this.refreshTx = () => {
    this.tx = angular.copy(txTemplate);
  };

  this.setSweep = () => {
    this.payment.setSweep();
    this.tx.amount = this.payment.amount;
  };

  this.isAddress = (address) => {
    return Ethereum.isAddress(address);
  };

  this.onScan = (result) => {
    if (this.isAddress(result)) {
      this.tx.to = result;
    }
  };

  this.setTo = () => {
    let { to } = this.tx;
    if (to && this.isAddress(to)) this.payment.setTo(to);
  };

  this.setAmount = () => {
    let { amount } = this.tx;
    if (amount) this.payment.setValue(amount);
  };

  this.nextStep = () => {
    this.payment.sign();
    $scope.vm.toConfirmView();
  };

  this.send = () => {
    this.payment.publish().then(({ hash }) => {
      $scope.vm.close();
      this.account.fetchBalance();
      console.log('sent ether:', hash);
      Alerts.displaySuccess('Successfully sent Ether!').then(() => {
        let win = $window.open(`https://etherscan.io/tx/${hash}`, '__blank');
        win.opener = null;
      });
    });
  };

  this.refreshTx();

  this.account.fetchBalance();
  window.ctrl = this;
}
