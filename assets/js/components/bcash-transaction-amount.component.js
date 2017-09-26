angular
  .module('walletApp')
  .component('bcashTransactionAmount', {
    bindings: {
      transaction: '=',
      confirmationsNeeded: '='
    },
    templateUrl: 'templates/bcash-transaction-amount.pug',
    controller: bcashTransactionAmountController,
    controllerAs: '$ctrl'
  });

function bcashTransactionAmountController (MyBlockchainApi, Wallet, currency, Ethereum) {
  this.tx = this.transaction;
  this.showFiat = true;
  // this.txType = this.tx.getTxType(Ethereum.eth.activeAccountsWithLegacy);

  this.settings = Wallet.settings;
  this.isBitCurrency = currency.isBitCurrency;
  this.toggleTx = () => this.showFiat = !this.showFiat;
  this.toggle = Wallet.toggleDisplayCurrency;
  // this.absolute = (value) => Math.abs(value);

  this.totalAmount = parseFloat(this.tx.fee) + parseFloat(this.tx.amount);
}
