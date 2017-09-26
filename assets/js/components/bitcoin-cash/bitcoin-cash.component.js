angular
  .module('walletApp')
  .component('bitcoinCash', {
    bindings: {

    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash.pug',
    controller: bitcoinCashController,
    controllerAs: '$ctrl'
  });

function bitcoinCashController (modals, MyWallet, Wallet, ShapeShift) {
  ShapeShift.fetchFullTrades();

  this.transactionViewOpen = false;
  this.hasBalance = () => true;
  this.hasTransactions = () => true;
  this.toggleTransactionView = () => {
    this.transactionViewOpen = !this.transactionViewOpen;
  };

  let txList = MyWallet.wallet.txList;
  this.bcashTransactions = txList.transactions();

  this.showingBalance = false;
  this.showBalance = () => {
    modals.openBitcoinCash().closed.then(() => this.showingBalance = true);
  };
  this.openWithStep = step => modals.openBitcoinCash(step);

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);
  this.completedTrades = () => this.trades.some(t => t.isComplete || t.isFailed || t.isResolved);
  this.pendingTrades = () => this.trades.some(t => t.isProcessing || t.isWaitingForDeposit);

  console.log('bch wallet', Wallet.my.wallet.bch);
}
