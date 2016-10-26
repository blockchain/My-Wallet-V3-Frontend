
angular
  .module('walletApp')
  .controller('LogoutController', LogoutController);

function LogoutController ($scope, $cookies, $q, $interval, $state, Wallet, Alerts) {
  $scope.deauth = () => {
    $scope.deauthorizing = true;
    let sessionToken = $cookies.get('session');
    $cookies.remove('session');

    $q.resolve(Wallet.my.endSession(sessionToken))
      .then(() => $scope.deauthorized = true)
      .catch(() => { Alerts.displayError('ERROR_DEAUTH'); })
      .finally(() => $scope.deauthorizing = false);
  };

  $scope.timeToRedirect = 10;
  $interval(() => {
    if (--$scope.timeToRedirect === 0) {
      $state.go('public.login-no-uid');
    }
  }, 1000);
}
