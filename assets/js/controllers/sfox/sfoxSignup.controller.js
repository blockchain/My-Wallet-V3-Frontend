angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxSignupController ($stateParams, exchange) {
  this.exchange = exchange;
  this.steps = enumify('create', 'verify', 'link', 'buy');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };
  // this.goTo('create');
  this.goTo('link');
}
