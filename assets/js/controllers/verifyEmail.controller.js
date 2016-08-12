angular
  .module('walletApp')
  .controller('VerifyEmailCtrl', VerifyEmailCtrl);

  // Wallet is injected to ensure it's lazy-load before this controller is
  // initialized. Otherwise $rootScope.rootUrl will be incorrect.
function VerifyEmailCtrl ($window, $scope, Wallet, WalletTokenEndpoints, $stateParams, $q, MyWalletHelpers) {
  $scope.state = 'pending';

  const success = (res) => {
    $scope.state = 'success';
    // Prompt to open iOS app
    if (MyWalletHelpers.getMobileOperatingSystem() === 'iOS') {
      $window.location.href = 'blockchain-wallet://emailVerified';
    }
  };

  const error = (res) => {
    $scope.state = 'error';
    $scope.error = res.initial_error || res.error;
  };

  $q.resolve(WalletTokenEndpoints.verifyEmail($stateParams.token)).then(success, error);
}
