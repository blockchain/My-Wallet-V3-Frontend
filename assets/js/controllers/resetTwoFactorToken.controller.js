angular
  .module('walletApp')
  .controller('ResetTwoFactorTokenCtrl', ResetTwoFactorTokenCtrl);

function ResetTwoFactorTokenCtrl ($scope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate, $rootScope) {
  Alerts.clear();

  const success = (obj) => {
    $scope.checkingToken = false;

    $state.go('public.login-uid', { uid: obj.guid }).then(() => {
      Alerts.displayResetTwoFactor(obj.message);
    });

    $rootScope.$safeApply();
  };

  const error = (res) => {
    $scope.checkingToken = false;
    $state.go('public.login-no-uid');
    Alerts.displayError(res.error, true);
    $rootScope.$safeApply();
  };

  $scope.checkingToken = true;

  WalletTokenEndpoints.then((service) => {
    service.resetTwoFactor($stateParams.token).then(success).catch(error);
  });
}
