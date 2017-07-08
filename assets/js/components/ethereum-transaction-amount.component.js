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

function ethereumTransactionAmountController (MyBlockchainApi, Wallet, currency) {
  this.tx = this.transaction;
  this.showFiat = true;

  this.settings = Wallet.settings;
  this.isBitCurrency = currency.isBitCurrency;
  this.toggleTx = () => this.showFiat = !this.showFiat;
  this.toggleTransactionDisplayCurrency = Wallet.toggleTransactionDisplayCurrency;
  this.toggle = Wallet.toggleDisplayCurrency;
  this.absolute = (value) => Math.abs(value);
}
