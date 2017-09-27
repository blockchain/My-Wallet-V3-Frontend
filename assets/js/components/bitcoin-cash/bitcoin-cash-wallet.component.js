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
  this.transactionViewOpen = false;
  this.toggleTransactionView = () => this.transactionViewOpen = !this.transactionViewOpen;
  this.balance = this.wallet.balance / 100000000;

  this.openSend = () => modals.openSend(null, { code: 'bch', index: this.wallet.index });
  this.openExchange = () => modals.openExchange({ code: 'bch', index: this.wallet.index });

  let txList = MyWallet.wallet.txList;
  this.bchTransactions = txList.transactions(this.wallet.index);

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);

  this.shiftTrades = [];
  this.bchTransactions.forEach(tx => {
    this.trades.filter(ss => {
      if (ss.depositHash === tx.hash) this.shiftTrades.push(ss);
    });
  });

  this.hasTransactions = () => this.bchTransactions.length > 0 || this.shiftTrades.length > 0;
}
