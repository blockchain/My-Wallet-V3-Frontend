angular
  .module('walletApp')
  .controller('BitcoinCashController', BitcoinCashController);

function BitcoinCashController ($uibModalInstance, step) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  this.steps = enumify('about', 'balance', 'exchange', 'send');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.dismiss = () => $uibModalInstance.dismiss();

  let hasSeenCashAbout = false;
  if (!hasSeenCashAbout) this.goTo('about');
  else if (step) this.goTo(step);
  this.setHasSeenCashAbout = () => hasSeenCashAbout = true;
}
