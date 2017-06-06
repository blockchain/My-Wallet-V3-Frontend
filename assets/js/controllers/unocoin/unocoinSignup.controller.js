angular
  .module('walletApp')
  .controller('UnocoinSignupController', UnocoinSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinSignupController ($stateParams, $uibModalInstance, unocoin, exchange, quote, Alerts) {
  this.name = 'Unocoin';
  this.mobileRequired = false;
  this.views = ['summary', 'email'];
  this.exchange = exchange;

  let links = [];
  this.quote = quote;

  this.steps = enumify('create', 'verify', 'upload', 'pending');
  this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
  this.afterStep = (s) => this.step > this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo(unocoin.determineStep(exchange));

  this.close = () => {
    Alerts.surveyCloseConfirm('unocoin-survey', links, this.step).then($uibModalInstance.dismiss);
  };
}
