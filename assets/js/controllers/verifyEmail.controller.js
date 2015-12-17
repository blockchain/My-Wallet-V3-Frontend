angular
  .module('walletApp')
  .controller("VerifyEmailCtrl", VerifyEmailCtrl);

function VerifyEmailCtrl($scope, Wallet, $stateParams, $state, Alerts) {
  const success = (uid) => {
    $state.go("public.login-uid", {uid: uid})
  }

  const error = (message) => {
    $state.go("public.login-no-uid");
    Alerts.displayError(error);
  }

  Wallet.verifyEmail($stateParams.token, success, error)
}
