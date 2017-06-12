angular
  .module('walletApp')
  .component('exchangeVerify', {
    bindings: {
      steps: '<',
      fields: '<',
      nextStep: '<',
      exchange: '<',
      onVerify: '&',
      onSetProfile: '&',
      mobilePreferred: '@'
    },
    templateUrl: 'templates/exchange/verify.pug',
    controller: ExchangeVerifyController,
    controllerAs: '$ctrl'
  });

function ExchangeVerifyController (Env, $scope, bcPhoneNumber, QA, unocoin, state, $q, Exchange) {
  Env.then(env => {
    this.buySellDebug = env.buySellDebug;
    let states = env.partners.sfox.states;
    this.states = state.stateCodes.filter((s) => states.indexOf(s.Code) > -1);
  });

  this.showField = (field) => this.fields.indexOf(field) > -1;

  $scope.format = bcPhoneNumber.format;
  this.format = bcPhoneNumber.format;

  this.isBeforeNow = (date) => {
    let then = new Date(date).getTime();
    return then < Date.now();
  };

  this.state = {
    step: 'address'
  };

  this.onStep = (step) => step === this.state.step;

  this.setProfile = () => {
    let fields = this.state;
    this.onSetProfile({fields: fields});
    this.steps.length > 1 ? this.state.step = this.steps.shift() && this.steps[0] : this.onVerify();
  };

  this.$onInit = () => this.state.step = this.steps[0];

  // QA Tools
  this.unocoinInfoForm = () => angular.merge(this.state, QA.unocoinInfoForm());
  this.unocoinAddressForm = () => angular.merge(this.state, QA.unocoinAddressForm());
  this.SFOXAddressForm = () => angular.merge(this.state, QA.SFOXAddressForm());

  this.qa = () => {
    let name = this.exchange.constructor.name;
    if (name === 'Unocoin') {
      this.onStep('address') ? this.unocoinAddressForm() : this.unocoinInfoForm();
    } else if (name === 'SFOX') {
      this.SFOXAddressForm();
    }
  };
}
