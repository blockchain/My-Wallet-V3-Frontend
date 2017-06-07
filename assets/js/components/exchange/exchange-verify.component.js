angular
  .module('walletApp')
  .component('exchangeVerify', {
    bindings: {
      exchange: '<',
      fields: '<',
      steps: '<',
      nextStep: '<',
      mobilePreferred: '@',
      exchangeName: '@',
      goTo: '&'
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
  this.nextComponentStep = (step) => this.state.step = step;

  this.setAddress = () => {
    let fields = this.state;
    let profile = this.exchange.profile;

    profile.fullName = fields.fullName;
    profile.firstName = fields.firstName;
    profile.middleName = fields.middleName;
    profile.lastName = fields.lastName;
    profile.mobile = fields.mobile;
    profile.pancard = fields.pancard;
    profile.address.street = fields.street;
    profile.address.city = fields.city;
    profile.address.state = fields.state;
    profile.address.zipcode = fields.zipcode;
    profile.dateOfBirth = new Date(fields.dob);

    if (profile.setSSN) {
      profile.setSSN(fields.ssn);
      profile.setAddress(
        fields.addr1,
        fields.addr2,
        fields.city,
        fields.state.Code,
        fields.zipcode
      );
    }

    this.steps.length > 1 ? this.nextComponentStep(this.steps[1]) : this.verifyProfile(profile);
  };

  this.verifyProfile = (profile) => {
    $q.resolve(profile.verify())
    .then(() => this.goTo({step: this.nextStep}))
    .catch(Exchange.displayError);
  };

  this.setInfo = () => {
    let fields = this.state;
    let profile = this.exchange.profile;

    profile.bankAccountNumber = fields.bankAccountNumber;
    profile.ifsc = fields.ifsc;

    this.goTo({step: this.nextStep});
  };

  this.$onInit = () => this.state.step = this.steps[0];

  // QA Tools
  this.unocoinInfoForm = () => angular.merge(this.state, QA.unocoinInfoForm());
  this.unocoinAddressForm = () => angular.merge(this.state, QA.unocoinAddressForm());
  this.SFOXAddressForm = () => angular.merge(this.state, QA.SFOXAddressForm());

  this.qa = () => {
    if (this.exchangeName === 'Unocoin') {
      this.onStep('address') ? this.unocoinAddressForm() : this.unocoinInfoForm();
    }
    if (this.exchangeName === 'SFOX') {
      this.SFOXAddressForm();
    }
  };
}
