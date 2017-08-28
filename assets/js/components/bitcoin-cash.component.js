angular
  .module('walletApp')
  .component('bitcoinCash', {
    bindings: {

    },
    templateUrl: 'templates/bitcoin-cash.pug',
    controller: bitcoinCashController,
    controllerAs: '$ctrl'
  });

function bitcoinCashController (modals) {
  this.hasBalance = () => true;
  this.showingBalance = false;
  this.hasNotSeenAbout = true;
  this.showBalance = () => {
    if (this.hasNotSeenAbout) {
      modals.openBitcoinCash().closed.then(() => this.showingBalance = true);
    }
  };
  this.openToExchange = () => modals.openBitcoinCash('exchange');
  this.openToSend = () => modals.openBitcoinCash('send');
}
