angular
  .module('walletApp')
  .controller("VerifyEmailCtrl", VerifyEmailCtrl);

function VerifyEmailCtrl($scope, WalletNetwork, $stateParams, $state, Alerts, $translate, $rootScope) {
  const success = (uid) => {
    $state.go("public.login-uid", {uid: uid}).then(() =>{
      Alerts.displayVerifiedEmail()
    });
  }

  const error = (message) => {
    $state.go("public.login-no-uid");
    Alerts.displayError(message, true);
  }

  WalletNetwork.verifyEmail($stateParams.token).then(success).catch(error);
}
