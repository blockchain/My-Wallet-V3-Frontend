angular
  .module('walletApp')
  .component('sendConfirm', {
    bindings: {
      tx: '<',
      asset: '<',
      locked: '<',
      warning: '<',
      onSend: '&',
      onGoBack: '&'
    },
    templateUrl: 'partials/send/send-confirm.pug',
    controller: SendConfirmController
  });

function SendConfirmController (Wallet, currency, $rootScope) {
  this.getTransactionTotal = (includeFee) => {
    let tx = this.tx;
    let fee = includeFee ? tx.fee : 0;
    return tx.amount + fee;
  };

  this.fromSatoshi = currency.convertFromSatoshi;
  this.bchCurr = currency.bchCurrencies[0];
  this.ethCurr = currency.ethCurrencies[0];
  this.btcCurr = currency.bitCurrencies[0];

  this.getButtonContent = () => {
    if (this.asset === 'eth') return 'SEND_ETHER';
    if (this.asset === 'btc') return this.tx.destination.type !== 'External' ? 'TRANSFER_BITCOIN' : 'SEND_BITCOIN';
    if (this.asset === 'bch') return this.tx.destination.type !== 'External' ? 'TRANSFER_BITCOIN_CASH' : 'SEND_BITCOIN_CASH';
  };

  this.size = $rootScope.size;
}
