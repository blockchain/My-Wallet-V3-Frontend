angular
  .module('walletApp')
  .component('exchangeVerify', {
    bindings: {
      steps: '<',
      fields: '<',
      nextStep: '<',
      exchange: '<',
      initialStep: '<',
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

  let exchange = this.exchange;

  this.profile = exchange.profile;
  this.name = exchange.constructor.name.toLowerCase();
  this.showField = (field) => this.fields.indexOf(field) > -1;

  $scope.isValidMobileNumber = bcPhoneNumber.isValid;
  $scope.format = bcPhoneNumber.format;

  this.isBeforeNow = (date) => {
    let then = new Date(date).getTime();
    return then < Date.now();
  };

  this.onStep = (step) => step === this.state.step;

  this.setProfile = () => {
    this.onSetProfile();
    this.steps.length > 1 ? this.state.step = this.steps.shift() && this.steps[0] : this.onVerify();
  };

  this.state = {};
  this.$onInit = () => this.state.step = this.initialStep || this.steps[0];

  // QA Tools
  this.qa = {
    unocoin: {
      info: () => angular.merge(exchange.profile, QA.unocoin.infoForm()),
      address: () => angular.merge(exchange.profile, QA.unocoin.addressForm())
    },
    sfox: {
      address: () => angular.merge(exchange.profile, QA.sfox.addressForm())
    }
  };
}
