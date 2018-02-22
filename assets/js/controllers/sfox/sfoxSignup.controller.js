angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxSignupController ($stateParams, $uibModalInstance, sfox, exchange, Alerts, Env) {
  Env.then(env => {
    let links = env.partners.sfox.surveyLinks;

    this.close = (skipConfirm) => {
      if (skipConfirm) $uibModalInstance.dismiss();
      else Alerts.surveyCloseConfirm('sfox-survey', links, this.step).then($uibModalInstance.dismiss);
    };
  });

  // properties
  this.exchange = exchange;
  this.steps = enumify('create', 'verify', 'upload', 'link');

  // methods
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };
  this.checkStep = () => { this.goTo(sfox.determineStep(exchange)); };

  // init
  this.goTo(sfox.determineStep(this.exchange));
}
