angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope, $timeout, $q, Wallet, Alerts, sfox, bcPhoneNumber) {
  const views = ['summary', 'email', 'mobile'];
  let exchange = $scope.vm.exchange;
  let user = $scope.user = Wallet.user;

  let state = $scope.state = {
    terms: false,
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
    let form = $scope.$$childHead.accountForm;
    switch (JSON.parse(error).error) {
      case 'user is already registered':
        form.email.$setValidity('registered', false);
        break;
      default:
        sfox.displayError(error);
    }
  };

  $scope.clearInlineErrors = () => {
    let form = $scope.$$childHead.accountForm;
    form.email.$setValidity('registered', true);
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
      .then($scope.setState, sfox.displayError).finally($scope.free);
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
      .then($scope.setState, sfox.displayError).finally($scope.free);
  };

  $scope.mobileFormSubmit = () => {
    if ($scope.state.sentMobileCode) $scope.verifyMobile();
    else $scope.changeMobile();
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
    let shouldSendEmail = !state.verifiedEmail && state.email && state.email.indexOf('@') > -1;
    let shouldSendMobile = !state.verifiedMobile && bcPhoneNumber.isValid(state.mobile);
    if (view === 'email' && shouldSendEmail) $scope.sendEmailCode();
    if (view === 'mobile' && shouldSendMobile) $scope.sendMobileCode();
  });

  $scope.setState();
  $scope.installLock();
}
