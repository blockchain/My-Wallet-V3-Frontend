angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxSignupController ($stateParams, $uibModalInstance, sfox, exchange, accounts, quote, Alerts, Env) {
  let links = Env.partners.sfox.surveyLinks;

  this.close = () => {
    Alerts.surveyCloseConfirm('sfox-survey', links, this.step).then($uibModalInstance.dismiss);
  };
  this.exchange = exchange;
  this.accounts = accounts;
  this.quote = quote;

  this.steps = enumify('create', 'verify', 'link', 'buy');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };

  this.goTo(sfox.determineStep(exchange, accounts));
}
