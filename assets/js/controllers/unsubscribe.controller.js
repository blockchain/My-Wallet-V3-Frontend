angular
  .module('walletApp')
  .controller("UnsubscribeCtrl", UnsubscribeCtrl);

function UnsubscribeCtrl($scope, WalletNetwork, $stateParams, $state, Alerts, $translate) {
  const success = (uid) => {

    if(uid) {
      $translate('UNSUBSCRIBE_SUCCESS').then(translation => {
        $state.go("public.login-uid", {uid: uid}).then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    } else {
      $translate('UNSUBSCRIBE_SUCCESS').then(translation => {
        $state.go("public.login-no-uid").then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    }


  }

  const error = (message) => {
    $state.go("public.login-no-uid");
    Alerts.displayError(message, true);
  }

  WalletNetwork.unsubscribe($stateParams.token).then(success).catch(error);
}
