angular
  .module('walletApp')
  .controller('UnsubscribeCtrl', UnsubscribeCtrl);

function UnsubscribeCtrl ($scope, $rootScope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate) {
  Alerts.clear();

  const success = (res) => {
    $state.go('public.login-uid', {uid: res.guid}).then(() => {
      Alerts.displaySuccess('UNSUBSCRIBE_SUCCESS');
    });
    $rootScope.$safeApply();
  };

  const error = (res) => {
    $state.go('public.login-no-uid').then(() => {
      Alerts.displayError(res.error, true);
    });
    $rootScope.$safeApply();
  };

  WalletTokenEndpoints.then((service) => {
    service.unsubscribe($stateParams.token).then(success).catch(error);
  });
}
