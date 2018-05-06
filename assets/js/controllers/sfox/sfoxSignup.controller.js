angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxSignupController ($stateParams, $uibModalInstance, sfox, exchange, accounts, Alerts, Env) {
  Env.then(env => {
    let links = env.partners.sfox.surveyLinks;

    this.close = (skipConfirm) => {
      if (skipConfirm) $uibModalInstance.dismiss();
      else Alerts.surveyCloseConfirm('sfox-survey', links, this.step).then($uibModalInstance.dismiss);
    };
  });

  this.provider = 'SFOX';
  this.exchange = exchange;
  this.accounts = accounts;

  this.steps = enumify('create', 'verify', 'upload', 'link');
  this.displaySteps = ['create', 'verify', 'upload', 'link'];
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };
  this.checkStep = () => { this.goTo(sfox.determineStep(exchange, accounts)); };

  this.goTo(sfox.determineStep(exchange, accounts));
}
