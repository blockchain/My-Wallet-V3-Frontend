
angular
  .module('walletApp')
  .controller('LogoutController', LogoutController);

function LogoutController ($scope, $cookies, $q, Wallet, Alerts) {
  $scope.deauth = () => {
    $scope.deauthorizing = true;
    let sessionToken = $cookies.get('session');
    $cookies.remove('session');

    $q.resolve(Wallet.my.endSession(sessionToken))
      .then(() => $scope.deauthorized = true)
      .catch(() => { Alerts.displayError('ERROR_DEAUTH'); })
      .finally(() => $scope.deauthorizing = false);
  };
}
