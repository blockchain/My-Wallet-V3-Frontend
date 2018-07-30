angular
  .module('walletApp')
  .controller('UnocoinSignupController', UnocoinSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinSignupController ($stateParams, $uibModalInstance, unocoin, exchange, quote, Alerts, Env) {
  Env.then(env => {
    let links = env.partners.unocoin.surveyLinks;

    this.close = (skipConfirm) => {
      if (skipConfirm) $uibModalInstance.dismiss();
      else Alerts.surveyCloseConfirm('unocoin-signup-survey', links, this.step).then($uibModalInstance.dismiss);
    };
  });

  this.provider = 'UNOCOIN';
  this.exchange = exchange;
  this.quote = quote;

  this.steps = enumify('create', 'verify', 'upload', 'pending');
  this.displaySteps = ['create', 'verify', 'upload'];
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo(unocoin.determineStep(exchange));
}
