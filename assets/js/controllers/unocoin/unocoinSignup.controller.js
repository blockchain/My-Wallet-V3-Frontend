angular
  .module('walletApp')
  .controller('UnocoinSignupController', UnocoinSignupController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinSignupController ($stateParams, $uibModalInstance, unocoin, exchange, accounts, quote, options, Alerts) {
  let links = options.partners.unocoin.surveyLinks || [];
  this.exchange = exchange;
  this.accounts = accounts;
  this.quote = quote;

  this.steps = enumify('create', 'verify', 'buy');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => { this.step = this.steps[s]; };

  this.goTo(unocoin.determineStep(exchange, accounts));

  this.close = () => {
    Alerts.surveyCloseConfirm('unocoin-survey', links, this.step).then($uibModalInstance.dismiss);
  };
}
