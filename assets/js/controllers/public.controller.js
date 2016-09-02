angular
  .module('walletApp')
  .controller('PublicCtrl', PublicCtrl);

function PublicCtrl ($scope, $rootScope, $q, $http, $cookies) {
  // Set a default wallet identifier for the login and reset password pages.
  // First check if a uid cookie is set. If this fails, loginFormUID will
  // resolve with null.
  $scope.setLoginFormUID = () => {
    let defer = $q.defer();
    $rootScope.loginFormUID = defer.promise;
    if ($cookies.get('uid')) {
      defer.resolve($cookies.get('uid'));
    } else {
      defer.resolve(null);
    }
  };

  // Don't automatically run during tests:
  if (!$scope.karma) {
    $scope.setLoginFormUID();
  }
}
