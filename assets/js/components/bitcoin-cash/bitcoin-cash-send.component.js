angular
  .module('walletApp')
  .component('bitcoinCashSend', {
    bindings: {
      wallet: '<',
      onContinue: '&',
      onAddressChange: '&'
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-send.pug',
    controller: bitcoinCashSendController,
    controllerAs: '$ctrl'
  });

function bitcoinCashSendController (Wallet, format, currency) {
  this.bchCurrency = currency.bchCurrencies[0];
  this.fiatCurrency = Wallet.settings.currency;
  this.bchAmount = currency.convertFromSatoshi(this.wallet.balance, this.bchCurrency);

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
