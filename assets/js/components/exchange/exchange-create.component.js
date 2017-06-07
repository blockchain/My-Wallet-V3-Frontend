angular
  .module('walletApp')
  .component('exchangeCreate', {
    bindings: {
      exchangeName: '<',
      mobileRequired: '<',
      views: '<',
      exchange: '<',
      goTo: '&',
      termsOfService: '@',
      privacyAgreement: '@'
    },
    templateUrl: 'templates/exchange/create.pug',
    controller: ExchangeCreateController,
    controllerAs: '$ctrl'
  });

function ExchangeCreateController (Env, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, modals, $uibModal, localStorageService, unocoin) {
  const cookieIds = { SENT_EMAIL: 'sentEmailCode', SENT_MOBILE: 'sentMobileCode' };
  this.user = Wallet.user;

  this.view = (v) => { this.state.view = v; };
  this.viewing = (v) => v === this.state.view;

  const resolveView = (state) => {
    let i;
    if (this.mobileRequired) {
      i = !state.verifiedEmail ? 1 : !state.verifiedMobile ? 2 : 0;
    } else {
      i = !state.verifiedEmail ? 1 : 0;
    }
    return this.views[i];
  };

  this.state = {
    terms: false,
    sentEmailCode: localStorageService.get(cookieIds.SENT_EMAIL),
    sentMobileCode: localStorageService.get(cookieIds.SENT_MOBILE),
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
    switch (unocoin.interpretError(error)) {
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
        unocoin.displayError(error);
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
    this.clearInlineErrors();
    $q(Wallet.changeEmail.bind(null, this.state.email))
      .then(() => $q(Wallet.sendConfirmationCode))
      .then(this.emailCodeSent).then($scope.setState, unocoin.displayError).finally($scope.free);
  };

  this.sendEmailCode = () => {
    $q(Wallet.sendConfirmationCode).then(this.emailCodeSent, unocoin.displayError);
  };

  this.verifyEmail = () => {
    $q(Wallet.verifyEmail.bind(null, this.state.emailCode))
      .then(this.setState, this.displayInlineError).finally($scope.free);
  };

  this.changeMobile = () => {
    $q(Wallet.changeMobile.bind(null, this.state.mobile))
      .then(this.mobileCodeSent).then(this.setState, unocoin.displayError).finally($scope.free);
  };

  this.sendMobileCode = () => this.changeMobile();

  this.verifyMobile = () => {
    $q(Wallet.verifyMobile.bind(null, this.state.mobileCode))
      .then(this.setState, this.displayInlineError).finally($scope.free);
  };

  this.createAccount = () => {
    $q.resolve(this.exchange.signup())
      .then(() => this.exchange.fetchProfile())
      .then(() => this.goTo({step: 'verify'}))
      .catch(this.displayInlineError);
  };

  this.$onInit = () => this.setState();
}
