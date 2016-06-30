angular
  .module('walletApp')
  .controller('PublicCtrl', PublicCtrl);

function PublicCtrl ($scope, $rootScope, $q, $http, $cookies) {
  $rootScope.fetchLastKnownLegacyGuid = () => {
    let defer = $q.defer();

    $rootScope.$watch('rootURL', () => {
      $http.get($rootScope.rootURL + 'wallet-legacy/guid_from_cookie', {withCredentials: true}).success(data => {
        if (data.success) {
          defer.resolve(data.guid);
        } else {
          defer.reject();
        }
      }).error(() => {
        defer.reject();
      });
    });

    return defer.promise;
  };

  // Set a default wallet identifier for the login and reset password pages.
  // First check if a uid cookie is set. If not, check the guid_from_cookie
  // endpoint. loginFormUID is a promise, because using the endpoint is
  // asynchronous. If all fails, loginFormUID will resolve with null.
  $scope.setLoginFormUID = () => {
    let defer = $q.defer();
    $rootScope.loginFormUID = defer.promise;
    if ($cookies.get('uid')) {
      defer.resolve($cookies.get('uid'));
    } else {
      $scope.fetchLastKnownLegacyGuid().then((res) => {
        defer.resolve(res);
      }).catch(() => {
        defer.resolve(null);
      });
    }
  };

  // Don't automatically run during tests:
  if (!$scope.karma) {
    $scope.setLoginFormUID();
  }
}
