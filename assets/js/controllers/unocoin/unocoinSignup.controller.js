angular
  .module('walletApp')
  .controller('UnocoinSignupController', UnocoinSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinSignupController ($stateParams, $uibModalInstance, unocoin, exchange, quote, Alerts, Env) {
  let links;
  Env.then(env => links = env.partners.unocoin.surveyLinks);

  this.exchange = exchange;
  this.quote = quote;

  this.steps = enumify('create', 'verify', 'upload', 'pending');
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.close = (skipConfirm) => {
    if (skipConfirm) $uibModalInstance.dismiss();
    else Alerts.surveyCloseConfirm('unocoin-signup-survey', links, this.step).then($uibModalInstance.dismiss);
  };

  this.goTo(unocoin.determineStep(exchange));
}
