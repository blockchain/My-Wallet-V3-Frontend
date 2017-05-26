angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope, AngularHelper, $timeout, $q, localStorageService, Wallet, Alerts, sfox, bcPhoneNumber) {
  const views = ['summary', 'email', 'mobile'];
  const cookieIds = { SENT_EMAIL: 'sentEmailCode', SENT_MOBILE: 'sentMobileCode' };
  let exchange = $scope.vm.exchange;
  let user = $scope.user = Wallet.user;

  let state = $scope.state = {
    terms: false,
    sentEmailCode: localStorageService.get(cookieIds.SENT_EMAIL),
    sentMobileCode: localStorageService.get(cookieIds.SENT_MOBILE),
    get verified () { return this.verifiedEmail && this.verifiedMobile; }
  };

  $scope.resolveView = (state) => {
    let i = !state.verifiedEmail ? 1 : !state.verifiedMobile ? 2 : 0;
    return views[i];
  };

  $scope.view = (v) => { state.view = v; };
  $scope.viewing = (v) => v === state.view;

  $scope.format = bcPhoneNumber.format;

  $scope.setState = () => {
    state.email = user.email;
    state.mobile = user.mobileNumber;
    state.verifiedEmail = user.isEmailVerified;
    state.verifiedMobile = user.isMobileVerified;
    state.sentEmailCode = !state.verifiedEmail && state.sentEmailCode;
    state.sentMobileCode = !state.verifiedMobile && state.sentMobileCode;
    state.mobileCode = state.emailCode = '';
    state.view = $scope.resolveView(state);
  };

  $scope.emailCodeSent = () => { state.sentEmailCode = true; };
  $scope.mobileCodeSent = () => { state.sentMobileCode = true; };

  $scope.displayInlineError = (error) => {
    let { accountForm, emailForm, mobileForm } = $scope.$$childHead;
    switch (sfox.interpretError(error)) {
      case 'user is already registered':
        accountForm.email.$setValidity('registered', false);
        break;
      case 'Email Verification Code Incorrect':
        emailForm.emailCode.$setValidity('correct', false);
        break;
      case 'Could not verify mobile number.':
        mobileForm.mobileCode.$setValidity('correct', false);
        break;
      default:
        sfox.displayError(error);
    }
  };

  $scope.clearInlineErrors = () => {
    let { accountForm, emailForm, mobileForm } = $scope.$$childHead;
    accountForm.email.$setValidity('registered', true);
    emailForm.emailCode.$setValidity('correct', true);
    mobileForm.mobileCode.$setValidity('correct', true);
  };

  $scope.changeEmail = () => {
    $scope.lock();
    $scope.clearInlineErrors();
    $q(Wallet.changeEmail.bind(null, state.email))
      .then(() => $q(Wallet.sendConfirmationCode))
      .then($scope.emailCodeSent).then($scope.setState, sfox.displayError).finally($scope.free);
  };

  $scope.sendEmailCode = () => {
    $q(Wallet.sendConfirmationCode).then($scope.emailCodeSent, sfox.displayError);
  };

  $scope.verifyEmail = () => {
    $scope.lock();
    $q(Wallet.verifyEmail.bind(null, state.emailCode))
      .then($scope.setState, $scope.displayInlineError).finally($scope.free);
  };

  $scope.changeMobile = () => {
    $scope.lock();
    $q(Wallet.changeMobile.bind(null, state.mobile))
      .then($scope.mobileCodeSent).then($scope.setState, sfox.displayError).finally($scope.free);
  };

  $scope.sendMobileCode = () => {
    $scope.changeMobile();
  };

  $scope.verifyMobile = () => {
    $scope.lock();
    $q(Wallet.verifyMobile.bind(null, state.mobileCode))
      .then($scope.setState, $scope.displayInlineError).finally($scope.free);
  };

  $scope.createAccount = () => {
    $scope.lock();
    $q.resolve(exchange.signup())
      .then(() => exchange.fetchProfile())
      .then(() => $scope.vm.goTo('verify'))
      .catch($scope.displayInlineError)
      .finally($scope.free);
  };

  $scope.$watch('user.isEmailVerified', $scope.setState);
  $scope.$watch('user.isMobileVerified', $scope.setState);

  $scope.$watch('state.view', (view) => {
    let shouldSendEmail =
      !state.verifiedEmail &&
      !localStorageService.get('sentEmailCode') &&
      state.email &&
      state.email.indexOf('@') > -1;

    let shouldSendMobile =
      !state.verifiedMobile &&
      !localStorageService.get('sentMobileCode') &&
      bcPhoneNumber.isValid(state.mobile);

    if (view === 'email' && shouldSendEmail) $scope.sendEmailCode();
    if (view === 'mobile' && shouldSendMobile) $scope.sendMobileCode();
  });

  let syncCookie = (id) => localStorageService.set.bind(localStorageService, id);
  $scope.$watch('state.sentEmailCode', syncCookie(cookieIds.SENT_EMAIL));
  $scope.$watch('state.sentMobileCode', syncCookie(cookieIds.SENT_MOBILE));

  $scope.setState();
  AngularHelper.installLock.call($scope);
}
