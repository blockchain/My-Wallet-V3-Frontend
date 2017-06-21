angular
  .module('walletApp')
  .component('exchangeVerify', {
    bindings: {
      steps: '<',
      error: '<',
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

function ExchangeVerifyController (Env, $scope, bcPhoneNumber, QA, unocoin, state, $q, $timeout, Exchange, AngularHelper) {
  Env.then(env => {
    this.buySellDebug = env.buySellDebug;
    let states = env.partners.sfox.states;
    this.states = state.stateCodes.filter((s) => states.indexOf(s.Code) > -1);
  });

  this.goTo = (s) => this.step = this.steps[s];
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo(this.initialStep);

  this.displayInlineError = (error) => {
    switch (Exchange.interpretError(error)) {
      case 'Please enter valid pincode':
        this.goTo('address');
        $timeout(() => $scope.$ctrl.addressForm.zipcode.$setValidity('correct', false), 100);
        break;
      case 'Please enter valid pancard number':
        this.goTo('address');
        $timeout(() => $scope.$ctrl.addressForm.pancard.$setValidity('correct', false), 100);
        break;
      case 'Please select valid State and City':
        this.goTo('address');
        $timeout(() => $scope.$ctrl.addressForm.city.$setValidity('correct', false), 100);
        $timeout(() => $scope.$ctrl.addressForm.state.$setValidity('correct', false), 100);
        break;
      case 'You entered wrong account number':
        this.goTo('info');
        $timeout(() => $scope.$ctrl.infoForm.bankAccountNumber.$setValidity('correct', false), 100);
        break;
      case 'You entered wrong IFSC':
        this.goTo('info');
        $timeout(() => $scope.$ctrl.infoForm.ifsc.$setValidity('correct', false), 100);
        break;
      default:
        Exchange.displayError(error);
    }
  };

  this.clearInlineErrors = (form, input) => {
    $scope.$ctrl[form][input].$setUntouched();
    $scope.$ctrl[form][input].$setValidity('correct', true);
  };

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

  this.setProfile = () => {
    this.onSetProfile();
    this.step < Object.keys(this.steps).length - 1 ? this.step++ : this.onVerify();
  };

  this.error && this.displayInlineError(this.error);

  // QA Tools
  this.qa = () => {
    switch (true) {
      case this.onStep('address'):
        angular.merge(exchange.profile, QA[this.name]['addressForm']());
        break;
      case this.onStep('info'):
        angular.merge(exchange.profile, QA[this.name]['infoForm']());
        break;
    }
  };
}
