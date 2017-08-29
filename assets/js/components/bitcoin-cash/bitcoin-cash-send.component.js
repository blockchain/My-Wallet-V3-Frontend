angular
  .module('walletApp')
  .component('bitcoinCashSend', {
    bindings: {
      onContinue: '&',
      onAddressChange: '&'
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-send.pug',
    controller: bitcoinCashSendController,
    controllerAs: '$ctrl'
  });

function bitcoinCashSendController (modals, Wallet, format) {
  this.transaction = {
    destination: null,
    amount: null,
    fee: null
  };

  this.onAddressScan = (result) => {
    let address = Wallet.parsePaymentRequest(result);
    console.log('onAddressScan', address);
    if (Wallet.isValidAddress(address.address)) {
      this.transaction.destination = format.destination(address, 'External');
    } else {
      throw new Error('BITCOIN_ADDRESS_INVALID');
    }
  };
}
