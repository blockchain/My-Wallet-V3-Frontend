angular
  .module('walletApp')
  .controller('LogoutController', LogoutController);

function LogoutController ($scope, localStorageService, $q, $timeout, $interval, $state, $window, Wallet, Alerts) {
  $scope.timeToRedirect = 10;
  $scope.toLogin = () => { $state.go('public.login-no-uid'); };

  $scope.deauth = () => {
    $scope.deauthorizing = true;
    $scope.timeToRedirect = -1;
    let sessionToken = localStorageService.get('session');
    localStorageService.remove('session');

    $q.resolve(Wallet.my.endSession(sessionToken))
      .then(() => $scope.deauthorized = true)
      .catch(() => { Alerts.displayError('ERROR_DEAUTH'); })
      .finally(() => $scope.deauthorizing = false)
      .then(() => $timeout($scope.toLogin, 3000));
  };

  $scope.redirectInterval = $interval(() => {
    if (--$scope.timeToRedirect === 0) $scope.toLogin();
  }, 1000);

  $window.name = 'blockchain';
  $scope.$on('$destroy', () => $interval.cancel($scope.redirectInterval));
}
