angular
  .module('walletApp')
  .component('bitcoinCash', {
    bindings: {

    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash.pug',
    controller: bitcoinCashController,
    controllerAs: '$ctrl'
  });

function bitcoinCashController (modals, MyWallet, Wallet, localStorageService) {
  this.showBitcoinCashAbout = modals.openBitcoinCash;
  this.openWithStep = step => modals.openBitcoinCash(step);
  this.showWallets = () => localStorageService.get('bcash-about') || false;
}
