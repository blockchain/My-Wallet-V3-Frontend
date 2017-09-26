angular
  .module('walletApp')
  .component('bitcoinCashHistory', {
    bindings: {
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-history.pug',
    controller: bitcoinCashHistoryController,
    controllerAs: '$ctrl'
  });

function bitcoinCashHistoryController (modals, ShapeShift, MyWallet) {
  ShapeShift.fetchFullTrades();

  let txList = MyWallet.wallet.txList;
  this.bcashTransactions = txList.transactions();

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);
  this.completedTrades = () => this.trades.some(t => t.isComplete || t.isFailed || t.isResolved);
  this.pendingTrades = () => this.trades.some(t => t.isProcessing || t.isWaitingForDeposit);
}
