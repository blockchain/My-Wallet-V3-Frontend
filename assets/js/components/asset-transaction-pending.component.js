angular
  .module('walletApp')
  .component('assetTransactionPending', {
    bindings: {
      txType: '<',
      txConfirmations: '<',
      confirmations: '<',
      showTooltip: '<'
    },
    templateUrl: 'templates/asset-transaction-pending.pug',
    controller: assetTransactionPendingController,
    controllerAs: '$ctrl'
  });

function assetTransactionPendingController () {
  this.pendingMessageMap = {
    'sent': 'PENDING_TX_SENDER',
    'received': 'PENDING_TX_RECEIVER',
    'transfer': 'PENDING_TX_SENDER'
  };

  this.$onChanges = () => {
    this.complete = this.txConfirmations >= this.confirmations;
    if (this.showTooltip) this.message = this.pendingMessageMap[this.txType];
  };
}
