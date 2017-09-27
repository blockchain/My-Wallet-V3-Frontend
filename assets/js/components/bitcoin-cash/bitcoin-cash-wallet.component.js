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

  this.shiftTrades = this.trades.filter(ss => {
    return this.bchTransactions.some(tx => tx.hash === ss.depositHash);
  });

  this.hasTransactions = () => this.bchTransactions.length > 0 || this.shiftTrades.length > 0;
}
