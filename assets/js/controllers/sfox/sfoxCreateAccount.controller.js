angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope, $q, Wallet) {
  let user = $scope.user = Wallet.user;

  let state = $scope.state = {
    busy: false,
    terms: false
  };

  $scope.setState = () => {
    state.email = user.email;
    state.mobile = user.mobileNumber;
    state.verifiedEmail = user.isEmailVerified;
    state.verifiedMobile = user.isMobileVerified;
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

  $scope.lock = () => { state.busy = true; };
  $scope.free = () => { state.busy = false; };

  $scope.$watch('user.isEmailVerified', $scope.setState);
  $scope.$watch('user.isMobileVerified', $scope.setState);
  $scope.setState();
}
