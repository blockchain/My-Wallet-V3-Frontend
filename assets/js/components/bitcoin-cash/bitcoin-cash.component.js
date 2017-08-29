angular
  .module('walletApp')
  .component('bitcoinCash', {
    bindings: {

    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash.pug',
    controller: bitcoinCashController,
    controllerAs: '$ctrl'
  });

function bitcoinCashController (modals) {
  this.hasBalance = () => true;
  this.showingBalance = false;
  this.showBalance = () => {
    modals.openBitcoinCash().closed.then(() => this.showingBalance = true);
  };
  this.openWithStep = step => modals.openBitcoinCash(step);
}
