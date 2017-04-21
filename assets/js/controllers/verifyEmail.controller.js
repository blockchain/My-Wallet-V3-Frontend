angular
  .module('walletApp')
  .controller('VerifyEmailCtrl', VerifyEmailCtrl);

function VerifyEmailCtrl ($window, $scope, WalletTokenEndpoints, $stateParams, $q, MyWalletHelpers, Env) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
  });

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
