angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxSignupController ($stateParams, exchange, accounts) {
  this.exchange = exchange;
  this.accounts = accounts;

  this.steps = enumify('create', 'verify', 'link', 'buy');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };

  let profile = this.exchange.profile;
  if (!profile) {
    this.goTo('create');
  } else {
    let status = profile.verificationStatus;
    let hasAccount = this.accounts.length &&
                     this.accounts[0].status === 'active';

    if (status === 'unverified') {
      this.goTo('verify');
    } else if (!hasAccount) {
      this.goTo('link');
    } else {
      this.goTo('buy');
    }
  }
}
