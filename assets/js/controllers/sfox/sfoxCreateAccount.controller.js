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

  $scope.changeEmail = () => {
    Alerts.displayWarning('Send email code not implemented (would have sent email code just now, sent verification link instead)');
    $scope.lock();
    $q(Wallet.changeEmail.bind(null, state.email)).then($scope.emailCodeSent).then($scope.setState).finally($scope.free);
  };

  $scope.sendEmailCode = () => {
    Alerts.displayWarning('Send email code not implemented (would have sent email code just now). To get passed this step, verify your email via link and relog.');
    $timeout($scope.emailCodeSent, 500);
  };

  $scope.verifyEmail = () => {
    Alerts.displayWarning('Verify email by code not implemented (would have verified just now)');
    $timeout($scope.setState, 500);
  };

  $scope.changeMobile = () => {
    $scope.lock();
    $q(Wallet.changeMobile.bind(null, state.mobile)).then($scope.mobileCodeSent).then($scope.setState).finally($scope.free);
  };

  $scope.sendMobileCode = () => {
    $scope.changeMobile();
  };

  $scope.verifyMobile = () => {
    $q(Wallet.verifyMobile.bind(null, state.mobileCode)).then($scope.setState, sfox.displayError);
  };

  $scope.createAccount = () => {
    $scope.lock();
    $q.resolve(exchange.signup())
      .then(() => exchange.fetchProfile())
      .then(() => $scope.vm.goTo('verify'))
      .catch(sfox.displayError)
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
