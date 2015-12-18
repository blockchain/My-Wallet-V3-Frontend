angular
  .module('walletApp')
  .controller("AuthorizeApproveCtrl", AuthorizeApproveCtrl);

function AuthorizeApproveCtrl($window, $scope, Wallet, $stateParams, $state, Alerts, $translate) {
  const success = (uid) => {

    $window.close(); // This is sometimes ignored, hence the code below:

    if(uid) {
      $translate('AUTHORIZE_APPROVE_SUCCESS').then(translation => {
        $state.go("public.login-uid", {uid: uid}).then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    } else {
      $translate('AUTHORIZE_APPROVE_SUCCESS').then(translation => {
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

  Wallet.authorizeApprove($stateParams.token, success, error)
}
