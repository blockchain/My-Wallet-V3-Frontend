angular
  .module('walletApp')
  .component('ethereumTransactionAmount', {
    bindings: {
      transaction: '=',
      confirmationsNeeded: '='
    },
    templateUrl: 'templates/ethereum-transaction-amount.pug',
    controller: ethereumTransactionAmountController,
    controllerAs: '$ctrl'
  });

function ethereumTransactionAmountController (MyBlockchainApi, Wallet, currency, Ethereum) {
  this.tx = this.transaction;
  this.showFiat = true;
  this.txType = this.tx.getTxType(Ethereum.eth.activeAccountsWithLegacy);

  this.settings = Wallet.settings;
  this.isBitCurrency = currency.isBitCurrency;
  this.toggleTx = () => this.showFiat = !this.showFiat;
  this.toggle = Wallet.toggleDisplayCurrency;
  this.absolute = (value) => Math.abs(value);
  this.unconfirmed = () => this.tx.confirmations < this.confirmationsNeeded;

  this.txType === 'sent'
    ? this.totalAmount = parseFloat(this.tx.fee) + parseFloat(this.tx.amount)
    : this.totalAmount = parseFloat(this.tx.amount);
}
