angular
  .module('walletApp')
  .controller('VerifyEmailCtrl', VerifyEmailCtrl);

function VerifyEmailCtrl ($window, $scope, WalletTokenEndpoints, $stateParams, MyWalletHelpers) {
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

  WalletTokenEndpoints.verifyEmail($stateParams.token).then(success, error);
}
