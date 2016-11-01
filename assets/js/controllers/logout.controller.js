
angular
  .module('walletApp')
  .controller('LogoutController', LogoutController);

function LogoutController ($scope, $cookies, $q, $timeout, $interval, $state, Wallet, Alerts) {
  $scope.timeToRedirect = 10;
  $scope.toLogin = () => { $state.go('public.login-no-uid'); };

  $scope.deauth = () => {
    $scope.deauthorizing = true;
    $scope.timeToRedirect = -1;
    let sessionToken = $cookies.get('session');
    $cookies.remove('session');

    $q.resolve(Wallet.my.endSession(sessionToken))
      .then(() => $scope.deauthorized = true)
      .catch(() => { Alerts.displayError('ERROR_DEAUTH'); })
      .finally(() => $scope.deauthorizing = false)
      .then(() => $timeout($scope.toLogin, 3000));
  };

  $interval(() => {
    if (--$scope.timeToRedirect === 0) $scope.toLogin();
  }, 1000);
}
