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

  this.settings = Wallet.settings;
  this.isBitCurrency = currency.isBitCurrency;
  this.toggle = Wallet.toggleDisplayCurrency;
  this.absolute = (num) => Math.abs(num);
  this.fromSatoshi = currency.convertFromSatoshi;
  this.bchCurrency = currency.bchCurrencies[0];

  this.totalAmount = parseFloat(this.tx.fee) + parseFloat(this.tx.amount);
}
