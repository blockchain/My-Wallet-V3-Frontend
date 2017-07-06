angular
  .module('walletApp')
  .component('assetTransactionPending', {
    bindings: {
      transaction: '=',
      confirmations: '=',
      showTooltip: '='
    },
    templateUrl: 'templates/asset-transaction-pending.pug',
    controller: assetTransactionPendingController,
    controllerAs: '$ctrl'
  });

function assetTransactionPendingController () {
  this.complete = this.transaction.confirmations >= this.confirmations;

  this.pendingMessage = (transaction) => {
    switch (transaction.txType) {
      case 'sent':
        this.message = 'PENDING_TX_SENDER';
        break;
      case 'received':
        this.message = 'PENDING_TX_RECEIVER';
        break;
      case 'transfer':
        this.message = 'PENDING_TX_SENDER';
        break;
    }
  };
  if (this.showTooltip) this.pendingMessage(this.transaction);
}
