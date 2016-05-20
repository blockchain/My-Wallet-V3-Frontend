angular
  .module('walletApp')
  .controller('AppCtrl', AppCtrl);

function AppCtrl ($scope, Wallet, Alerts, $state, $rootScope, $cookies, $location, $timeout, $interval, $uibModal, $window, $translate, $uibModalStack, $http, $q) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $rootScope.isMock = Wallet.isMock;

  $scope.fetchLastKnownLegacyGuid = () => {
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

  $scope.goal = Wallet.goal;
  $scope.menu = {
    isCollapsed: false
  };

  $scope.toggleMenu = () => {
    $scope.menu.isCollapsed = !$scope.menu.isCollapsed;
  };

  $scope.hideMenu = () => {
    $scope.menu.isCollapsed = false;
  };

  $scope.inactivityTimeSeconds = 0;
  $scope.resetInactivityTime = () => $scope.inactivityTimeSeconds = 0;

  $scope.inactivityInterval = () => {
    if (!Wallet.status.isLoggedIn) return;
    $scope.inactivityTimeSeconds++;
    let logoutTimeSeconds = Wallet.settings.logoutTimeMinutes * 60;
    if ($scope.inactivityTimeSeconds === logoutTimeSeconds - 10) {
      let logoutTimer = $timeout(Wallet.my.logout, 10000);
      Alerts.confirm('AUTO_LOGOUT_WARN', { minutes: Wallet.settings.logoutTimeMinutes }, '', 'LOG_ME_OUT')
        .then(Wallet.logout).catch(() => $timeout.cancel(logoutTimer));
    }
  };

  $interval($scope.inactivityInterval, 1000);

  $rootScope.browserWithCamera = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) !== void 0;

  $scope.request = (hasLegacyAddress) => {
    Alerts.clear();
    $scope.requestBeacon = false;
    $uibModal.open({
      templateUrl: 'partials/request.jade',
      windowClass: 'bc-modal auto',
      controller: 'RequestCtrl',
      resolve: {
        destination: () => null,
        focus: () => false,
        hasLegacyAddress: () => hasLegacyAddress
      }
    });
  };

  $scope.send = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/send.jade',
      windowClass: 'bc-modal initial',
      controller: 'SendCtrl',
      resolve: {
        paymentRequest: () => ({
          address: '',
          amount: ''
        })
      }
    });
  };

  $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    let isPublicState = toState.name.slice(0, 6) === 'public';
    if (isPublicState && Wallet.status.isLoggedIn) event.preventDefault();
  });

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    let loggedOutStates = ['public', 'public.login-no-uid', 'public.login-uid', 'public.reset-two-factor', 'public.recover', 'public.reminder', 'public.signup', 'public.help', 'open', 'wallet.common.verify-email', 'wallet.common.unsubscribe', 'public.authorize-approve', 'public.reset-two-factor-token'];
    if (loggedOutStates.every(s => toState.name !== s) && $scope.status.isLoggedIn === false) {
      $state.go('public.login-no-uid');
    }
    $scope.requestBeacon = false;

    $uibModalStack.dismissAll();
  });

  $scope.$watch('status.isLoggedIn', () => {
    $timeout(() => {
      $scope.checkGoals();
    }, 0);
  });

  $scope.$watchCollection('goal', () => {
    $timeout(() => {
      $scope.checkGoals();
    }, 0);
  });

  $scope.checkGoals = () => {
    if ($scope.status.isLoggedIn) {
      if (!((Wallet.settings.currency != null) && (Wallet.settings.btcCurrency != null))) {
        return $timeout(() => {
          $scope.checkGoals();
        }, 100);
      }
      if (Wallet.goal != null) {
        if (Wallet.goal.send != null) {
          $uibModal.open({
            templateUrl: 'partials/send.jade',
            controller: 'SendCtrl',
            resolve: {
              paymentRequest: () => Wallet.goal.send
            },
            windowClass: 'bc-modal'
          });
          Wallet.goal.send = void 0;
        }
        if (Wallet.goal.claim != null) {
          let modalInstance = $uibModal.open({
            templateUrl: 'partials/claim.jade',
            controller: 'ClaimModalCtrl',
            resolve: {
              claim: () => Wallet.goal.claim
            },
            windowClass: 'bc-modal'
          });
          modalInstance.result.then(() => {
            Wallet.goal.claim = void 0;
          });
        }
        if (Wallet.goal.auth) {
          Alerts.clear();
          $translate(['AUTHORIZED', 'AUTHORIZED_MESSAGE']).then(translations => {
            $scope.$emit('showNotification', {
              type: 'authorization-verified',
              icon: 'ti-check',
              heading: translations.AUTHORIZED,
              msg: translations.AUTHORIZED_MESSAGE
            });
          });
        }
      }
    }
  };

  $scope.$on('enableRequestBeacon', () => {
    $scope.requestBeacon = true;
  });

  $scope.$on('requireSecondPassword', (notification, defer, insist) => {
    const modalInstance = $uibModal.open({
      templateUrl: 'partials/second-password.jade',
      controller: 'SecondPasswordCtrl',
      backdrop: insist ? 'static' : null,
      keyboard: insist,
      windowClass: 'bc-modal',
      resolve: {
        insist: () => insist,
        defer: () => defer
      }
    });
    modalInstance.result.then(() => {}, () => defer.reject());
  });

  $scope.$on('needsUpgradeToHD', notification => {
    $uibModal.open({
      templateUrl: 'partials/upgrade.jade',
      controller: 'UpgradeCtrl',
      backdrop: 'static',
      windowClass: 'bc-modal',
      keyboard: false
    });
  });

  $scope.back = () => $window.history.back();
}
