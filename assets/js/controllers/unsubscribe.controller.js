angular
  .module('walletApp')
  .controller('UnsubscribeCtrl', UnsubscribeCtrl);

function UnsubscribeCtrl ($scope, AngularHelper, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate) {
  Alerts.clear();

  const success = (res) => {
    $state.go('public.login-uid', {uid: res.guid}).then(() => {
      Alerts.displaySuccess('UNSUBSCRIBE_SUCCESS');
    });
    AngularHelper.$safeApply();
  };

  const error = (res) => {
    $state.go('public.login-no-uid').then(() => {
      Alerts.displayError(res.error, true);
    });
    AngularHelper.$safeApply();
  };

  WalletTokenEndpoints.unsubscribe($stateParams.token).then(success).catch(error);
}
