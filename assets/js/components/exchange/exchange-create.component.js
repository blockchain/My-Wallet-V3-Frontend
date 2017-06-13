angular
  .module('walletApp')
  .component('exchangeCreate', {
    bindings: {
      views: '<',
      exchange: '<',
      onCreate: '&',
      termsOfService: '@',
      privacyAgreement: '@'
    },
    templateUrl: 'templates/exchange/create.pug',
    controller: ExchangeCreateController,
    controllerAs: '$ctrl'
  });

function ExchangeCreateController ($scope, $q, Wallet, modals, $uibModal, localStorageService, Exchange, bcPhoneNumber, AngularHelper) {
  this.user = Wallet.user;
  this.name = this.exchange.constructor.name;
  this.view = (v) => { this.state.view = v; };
  this.viewing = (v) => v === this.state.view;

  const resolveView = (state) => {
    let i;
    if (this.views.indexOf('mobile') > -1) {
      i = !state.verifiedEmail ? 0 : !state.verifiedMobile ? 1 : 2;
    } else {
      i = !state.verifiedEmail ? 0 : 1;
    }
    return this.views[i];
  };

  this.state = {
    terms: false,
    get verified () { return this.verifiedEmail && this.verifiedMobile; }
  };

  this.setState = () => {
    this.state.email = this.user.email;
    this.state.mobile = this.user.mobileNumber;
    this.state.verifiedEmail = this.user.isEmailVerified;
    this.state.verifiedMobile = this.user.isMobileVerified;
    this.state.sentEmailCode = !this.state.verifiedEmail && this.state.sentEmailCode;
    this.state.sentMobileCode = !this.state.verifiedMobile && this.state.sentMobileCode;
    this.state.mobileCode = this.state.emailCode = '';
    this.state.view = resolveView(this.state);
  };

  this.emailCodeSent = () => { this.state.sentEmailCode = true; };
  this.mobileCodeSent = () => { this.state.sentMobileCode = true; };

  this.displayInlineError = (error) => {
    let { accountForm, emailForm, mobileForm } = $scope.$$childHead;
    switch (Exchange.interpretError(error)) {
      case 'user is already registered':
        accountForm.email.$setValidity('registered', false);
        break;
      case 'Email Verification Code Incorrect':
        emailForm.emailCode.$setValidity('correct', false);
        break;
      case 'Could not verify mobile number.':
        mobileForm.mobileCode.$setValidity('correct', false);
        break;
      case 'email_already_used':
        accountForm.email.$setValidity('registered', false);
        break;
      default:
        Exchange.displayError(error);
    }
  };

  $scope.$watch('user.isEmailVerified', this.setState());
  $scope.$watch('user.isMobileVerified', this.setState());

  this.clearInlineErrors = () => {
    let { accountForm, emailForm } = $scope.$$childHead;
    accountForm.email.$setValidity('registered', true);
    emailForm.emailCode.$setValidity('correct', true);
  };

  this.changeEmail = () => {
    this.lock();
    this.clearInlineErrors();
    $q(Wallet.changeEmail.bind(null, this.state.email))
      .then(() => $q(Wallet.sendConfirmationCode))
      .then(this.emailCodeSent).then($scope.setState, Exchange.displayError).finally(this.free);
  };

  this.sendEmailCode = () => {
    $q(Wallet.sendConfirmationCode).then(this.emailCodeSent, Exchange.displayError);
  };

  this.verifyEmail = () => {
    this.lock();
    $q(Wallet.verifyEmail.bind(null, this.state.emailCode))
      .then(this.setState, this.displayInlineError).finally(this.free);
  };

  this.changeMobile = () => {
    this.lock();
    $q(Wallet.changeMobile.bind(null, this.state.mobile))
      .then(this.mobileCodeSent).then(this.setState, Exchange.displayError).finally(this.free);
  };

  this.sendMobileCode = () => this.changeMobile();

  this.verifyMobile = () => {
    this.lock();
    $q(Wallet.verifyMobile.bind(null, this.state.mobileCode))
      .then(this.setState, this.displayInlineError).finally(this.free);
  };

  $scope.$watch('$ctrl.state.view', (view) => {
    let shouldSendEmail =
      !this.state.verifiedEmail &&
      this.state.email &&
      this.state.email.indexOf('@') > -1;

    let shouldSendMobile =
      !this.state.verifiedMobile &&
      bcPhoneNumber.isValid(this.state.mobile);

    if (view === 'email' && shouldSendEmail) this.sendEmailCode();
    if (view === 'mobile' && shouldSendMobile) this.sendMobileCode();
  });

  this.createAccount = () => {
    this.lock();
    $q.resolve(this.exchange.signup())
      .then(() => this.exchange.fetchProfile())
      .then(() => this.onCreate())
      .catch(this.displayInlineError)
      .finally(this.free);
  };

  this.$onInit = () => this.setState();
  AngularHelper.installLock.call(this);
}
