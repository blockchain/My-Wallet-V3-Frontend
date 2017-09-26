angular
  .module('walletApp')
  .component('bitcoinCashWallet', {
    bindings: {
      wallet: '<'
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-wallet.pug',
    controller: bitcoinCashWalletController,
    controllerAs: '$ctrl'
  });

function bitcoinCashWalletController (modals, ShapeShift, MyWallet, Wallet) {
  console.log('wallet', this.wallet);
  this.transactionViewOpen = false;
  this.toggleTransactionView = () => this.transactionViewOpen = !this.transactionViewOpen;
  this.hasTransactions = () => true;
  this.balance = this.wallet.balance / 100000000;

  this.openExchange = modals.openBitcoinCashExchange;
  this.openSend = () => modals.openSend(null, { code: 'bch', index: this.wallet.index });
}
