angular
  .module('walletApp')
  .controller('VerifyEmailCtrl', VerifyEmailCtrl);

function VerifyEmailCtrl ($window, $scope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate, $rootScope, MyWalletHelpers) {
  const success = (res) => {
    $state.go('public.login-uid', {uid: res.guid}).then(() => {
      Alerts.displayVerifiedEmail();
      // Prompt to open iOS app
      if (MyWalletHelpers.getMobileOperatingSystem() === 'iOS') {
        $window.location.href = 'blockchain-wallet://emailVerified';
      }
    });
    $rootScope.$safeApply();
  };

  const error = (res) => {
    $state.go('public.login-no-uid');
    Alerts.displayError(res.error, true);
    $rootScope.$safeApply();
  };

  WalletTokenEndpoints.verifyEmail($stateParams.token).then(success).catch(error);
}
