angular
  .module('walletApp')
  .controller('UnocoinCreateAccountController', UnocoinCreateAccountController);

function UnocoinCreateAccountController ($scope, AngularHelper, $timeout, $q, localStorageService, Wallet, Alerts, unocoin) {
  const views = ['summary', 'email'];
  const cookieIds = { SENT_EMAIL: 'sentEmailCode' };
  let exchange = $scope.vm.exchange;
  let user = $scope.user = Wallet.user;

  let state = $scope.state = {
    terms: false,
    sentEmailCode: localStorageService.get(cookieIds.SENT_EMAIL),
    get verified () { return this.verifiedEmail; }
  };

  $scope.resolveView = (state) => {
    let i = !state.verifiedEmail ? 1 : 0;
    return views[i];
  };

  $scope.view = (v) => { state.view = v; };
  $scope.viewing = (v) => v === state.view;

  $scope.setState = () => {
    state.email = user.email;
    state.verifiedEmail = user.isEmailVerified;
    state.sentEmailCode = !state.verifiedEmail && state.sentEmailCode;
    state.view = $scope.resolveView(state);
  };

  $scope.emailCodeSent = () => { state.sentEmailCode = true; };

  $scope.displayInlineError = (error) => {
    let { accountForm, emailForm } = $scope.$$childHead;
    switch (unocoin.interpretError(error)) {
      case 'user is already registered':
        accountForm.email.$setValidity('registered', false);
        break;
      case 'Email Verification Code Incorrect':
        emailForm.emailCode.$setValidity('correct', false);
        break;
      default:
        unocoin.displayError(error);
    }
  };

  $scope.clearInlineErrors = () => {
    let { accountForm, emailForm } = $scope.$$childHead;
    accountForm.email.$setValidity('registered', true);
    emailForm.emailCode.$setValidity('correct', true);
  };

  $scope.changeEmail = () => {
    $scope.lock();
    $scope.clearInlineErrors();
    $q(Wallet.changeEmail.bind(null, state.email))
      .then(() => $q(Wallet.sendConfirmationCode))
      .then($scope.emailCodeSent).then($scope.setState, unocoin.displayError).finally($scope.free);
  };

  $scope.sendEmailCode = () => {
    $q(Wallet.sendConfirmationCode).then($scope.emailCodeSent, unocoin.displayError);
  };

  $scope.verifyEmail = () => {
    $scope.lock();
    $q(Wallet.verifyEmail.bind(null, state.emailCode))
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

  $scope.$watch('state.view', (view) => {
    let shouldSendEmail =
      !state.verifiedEmail &&
      !localStorageService.get('sentEmailCode') &&
      state.email &&
      state.email.indexOf('@') > -1;

    if (view === 'email' && shouldSendEmail) $scope.sendEmailCode();
  });

  let syncCookie = (id) => localStorageService.set.bind(localStorageService, id);
  $scope.$watch('state.sentEmailCode', syncCookie(cookieIds.SENT_EMAIL));

  $scope.setState();
  AngularHelper.installLock.call($scope);
}
