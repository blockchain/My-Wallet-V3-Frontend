angular
  .module('walletApp')
  .component('bitcoinCash', {
    bindings: {

    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash.pug',
    controller: bitcoinCashController,
    controllerAs: '$ctrl'
  });

function bitcoinCashController (modals, MyWallet, Wallet) {
  this.transactionViewOpen = false;
  this.hasBalance = () => true;
  this.hasTransactions = () => true;
  this.toggleTransactionView = () => {
    console.log('toggleTransactionView', this.transactionViewOpen);
    this.transactionViewOpen = true;
  };

  let txList = MyWallet.wallet.txList;
  this.bcashTransactions = txList.transactions();
  console.log('tx list', txList, this.bcashTransactions);

  this.showingBalance = false;
  this.showBalance = () => {
    modals.openBitcoinCash().closed.then(() => this.showingBalance = true);
  };
  this.openWithStep = step => modals.openBitcoinCash(step);

  console.log('bch wallet', Wallet.my.wallet, Wallet.my.wallet.bch, Wallet.my.wallet.bch.getBalances());
}
