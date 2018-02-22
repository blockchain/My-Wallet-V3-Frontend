angular
  .module('walletApp')
  .component('exchangeSignupSteps', {
    bindings: {
      exchange: '<'
    },
    templateUrl: 'templates/exchange/signup-steps2.pug',
    controller: ExchangeSignupStepsController,
    controllerAs: 'vm'
  });

  function ExchangeSignupStepsController (sfox) {
    let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

    // properties
    this.provider = 'SFOX';
    this.steps = enumify('create', 'verify', 'upload', 'link');
    this.displaySteps = ['create', 'verify', 'upload', 'link'];

    // methods
    this.onOrAfterStep = (s) => this.afterStep(s) || this.onStep(s);
    this.afterStep = (s) => this.step > this.steps[s];
    this.onStep = (s) => this.steps[s] === this.step;
    this.goTo = (s) => { this.step = this.steps[s]; };

    if (this.exchange.user && !this.exchange.profile) {
      this.exchange.fetchProfile().then(() => { this.goTo(sfox.determineStep(this.exchange)) });
    } else {
      this.goTo(sfox.determineStep(this.exchange))
    }
}
