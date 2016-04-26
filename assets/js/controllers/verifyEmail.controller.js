angular
  .module('walletApp')
  .controller('VerifyEmailCtrl', VerifyEmailCtrl);

function VerifyEmailCtrl ($scope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate, $rootScope) {
  const success = (res) => {
    $state.go('public.login-uid', {uid: res.guid}).then(() => {
      Alerts.displayVerifiedEmail();
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
