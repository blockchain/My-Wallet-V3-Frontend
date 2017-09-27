angular
  .module('walletApp')
  .controller('BitcoinCashAboutController', BitcoinCashAboutController);

function BitcoinCashAboutController ($uibModalInstance, localStorageService, Wallet) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  this.steps = enumify('about', 'balance');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo('about');
  this.dismiss = () => $uibModalInstance.dismiss();
  this.setHasSeenCashAbout = () => localStorageService.set('bcash-about', true);
  this.activeWallets = Wallet.accounts().filter(a => !a.archived);
}
