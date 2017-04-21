angular
  .module('walletApp')
  .controller('AuthorizeApproveCtrl', AuthorizeApproveCtrl);

// Wallet is injected to ensure it's lazy-load before this controller is
// initialized. Otherwise $rootScope.rootUrl will be incorrect.
function AuthorizeApproveCtrl ($window, $scope, WalletTokenEndpoints, $stateParams, $state, Alerts, $translate, AngularHelper, MyWalletHelpers, Wallet) {
  $scope.success = false;

  const success = (res) => {
    $scope.checkingToken = false;
    $scope.busyApproving = false;
    $scope.busyRejecting = false;

    // If differentBrowser is called, success will be null:
    if (res.success == null) return;

    $scope.success = true;
    // Prompt to open iOS app
    if (MyWalletHelpers.getMobileOperatingSystem() === 'iOS') {
      $window.location.href = 'blockchain-wallet://loginAuthorized';
    }
    AngularHelper.$safeApply();
  };

  const error = (res) => {
    $scope.checkingToken = false;
    $scope.busyApproving = false;
    $scope.busyRejecting = false;

    $state.go('public.login-no-uid');
    Alerts.displayError(res.error, true);
    AngularHelper.$safeApply();
  };

  const differentBrowser = (details) => {
    $scope.checkingToken = false;

    $scope.differentBrowser = true;
    $scope.details = details;
    AngularHelper.$safeApply();
  };

  $scope.checkingToken = true;

  WalletTokenEndpoints.authorizeApprove($stateParams.token, differentBrowser, null)
    .then(success)
    .catch(error);

  $scope.approve = () => {
    $scope.busyApproving = true;
    WalletTokenEndpoints.authorizeApprove($stateParams.token, () => {}, true)
      .then(success)
      .catch(error);
  };

  $scope.reject = () => {
    $scope.busyRejecting = true;

    const rejected = () => {
      $scope.busyRejecting = false;
      $state.go('public.login-no-uid').then(() => Alerts.displaySuccess('AUTHORIZE_REJECT_SUCCESS'));
    };

    WalletTokenEndpoints.authorizeApprove($stateParams.token, () => {}, false)
      .then(rejected)
      .catch(error);
  };
}
