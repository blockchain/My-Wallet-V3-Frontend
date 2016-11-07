angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope, $q, Wallet, bcPhoneNumber) {
  let exchange = $scope.vm.exchange;
  let user = $scope.user = Wallet.user;

  let state = $scope.state = {
    terms: false
  };

  $scope.format = bcPhoneNumber.format;

  $scope.setState = () => {
    state.email = user.email;
    state.mobile = user.mobileNumber;
    state.verifiedEmail = user.isEmailVerified;
    state.verifiedMobile = user.isMobileVerified;
    state.isVerified = state.verifiedEmail && state.verifiedMobile;
  };

  $scope.changeEmail = () => {
    $scope.lock();
    let email = state.email;
    $q(Wallet.changeEmail.bind(null, email)).then($scope.setState).finally($scope.free);
  };

  $scope.verifyEmail = () => {
    let code = state.confirmEmail;
    $q(Wallet.verifyEmail.bind(null, code)).then($scope.setState);
  };

  $scope.changeMobile = () => {
    $scope.lock();
    state.sentCode = true;
    let mobile = state.mobile;
    $q(Wallet.changeMobile.bind(null, mobile)).then($scope.setState).finally($scope.free);
  };

  $scope.verifyMobile = () => {
    let code = state.confirmMobile;
    $q(Wallet.verifyMobile.bind(null, code)).then($scope.setState);
  };

  $scope.createAccount = () => {
    $scope.lock();
    $q.resolve(exchange.signup())
      .then(() => exchange.fetchProfile())
      .then(() => $scope.vm.goTo('verify'))
      .catch(error => console.error(error))
      .finally($scope.free);
  };

  $scope.$watch('user.isEmailVerified', $scope.setState);
  $scope.$watch('user.isMobileVerified', $scope.setState);
  $scope.setState();
  $scope.installLock();
}
