angular
  .module('walletApp')
  .controller('ResetTwoFactorTokenCtrl', ResetTwoFactorTokenCtrl);

function ResetTwoFactorTokenCtrl ($scope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate, AngularHelper, Env) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
  });

  Alerts.clear();

  const success = (obj) => {
    $scope.checkingToken = false;

    $state.go('public.login-uid', { uid: obj.guid }).then(() => {
      Alerts.displayResetTwoFactor(obj.message);
    });

    AngularHelper.$safeApply();
  };

  const error = (res) => {
    $scope.checkingToken = false;
    $state.go('public.login-no-uid');
    Alerts.displayError(res.error, true);
    AngularHelper.$safeApply();
  };

  $scope.checkingToken = true;

  WalletTokenEndpoints.resetTwoFactor($stateParams.token).then(success).catch(error);
}
