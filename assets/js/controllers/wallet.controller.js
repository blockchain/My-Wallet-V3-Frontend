angular
  .module('walletApp')
  .controller('WalletCtrl', WalletCtrl);

function WalletCtrl ($scope, $rootScope, Wallet, $uibModal, $timeout, Alerts, $interval, $ocLazyLoad, $state, $uibModalStack, $q, MyWallet, currency, $translate, $window) {
  $scope.goal = Wallet.goal;

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $rootScope.isMock = Wallet.isMock;

  $scope.menu = {
    isCollapsed: false
  };

  $scope.toggleMenu = () => {
    $scope.menu.isCollapsed = !$scope.menu.isCollapsed;
  };

  $scope.hideMenu = () => {
    $scope.menu.isCollapsed = false;
  };

  $scope.lastAction = Date.now();
  $scope.onAction = () => $scope.lastAction = Date.now();

  $scope.inactivityInterval = () => {
    if (!Wallet.status.isLoggedIn) return;
    let inactivityTimeSeconds = Math.round((Date.now() - $scope.lastAction) / 1000);
    let logoutTimeSeconds = Wallet.settings.logoutTimeMinutes * 60;
    if (inactivityTimeSeconds === logoutTimeSeconds - 10) {
      let logoutTimer = $timeout(Wallet.my.logout, 10000);
      Alerts.confirm('CONFIRM_AUTO_LOGOUT', { values: { minutes: Wallet.settings.logoutTimeMinutes }, action: 'LOG_ME_OUT' })
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
        }),
        loadBcQrReader: () => {
          return $ocLazyLoad.load('bcQrReader');
        }
      }
    });
  };

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

  $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    let isPublicState = toState.name === 'landing' || toState.name.slice(0, 6) === 'public';
    if (isPublicState && Wallet.status.isLoggedIn) event.preventDefault();
  });

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    let loggedOutStates = ['public', 'landing', 'public.login-no-uid', 'public.login-uid', 'public.reset-two-factor', 'public.recover', 'public.reminder', 'public.signup', 'public.help', 'open', 'wallet.common.verify-email', 'wallet.common.unsubscribe', 'public.authorize-approve', 'public.reset-two-factor-token'];
    if (loggedOutStates.every(s => toState.name !== s) && $scope.status.isLoggedIn === false) {
      $state.go('public.login-no-uid');
    }
    $rootScope.outOfApp = toState.name === 'landing';
    $scope.requestBeacon = false;

    $uibModalStack.dismissAll();
  });

  $rootScope.scheduleRefresh = () => {
    $scope.cancelRefresh();
    $scope.refreshTimeout = $timeout($scope.refresh, 3000);
  };

  $rootScope.cancelRefresh = () => {
    $timeout.cancel($scope.refreshTimeout);
  };

  $scope.refresh = () => {
    $scope.refreshing = true;
    $q.all([ MyWallet.wallet.getHistory(), currency.fetchExchangeRate() ])
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $scope.$broadcast('refresh');
        $timeout(() => $scope.refreshing = false, 500);
      });
  };

  $scope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
    let message = typeof error === 'string' ? error : 'ROUTE_ERROR';
    Alerts.displayError(message);
  });

  $scope.$watch('status.isLoggedIn + goal', () => $timeout($scope.checkGoals));

  $scope.checkGoals = () => {
    if ($scope.status.isLoggedIn) {
      if (Wallet.goal.upgrade) {
        $uibModal.open({
          templateUrl: 'partials/upgrade.jade',
          controller: 'UpgradeCtrl',
          backdrop: 'static',
          windowClass: 'bc-modal',
          keyboard: false
        });
        Wallet.goal.upgrade = void 0;
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
        Wallet.goal.auth = void 0;
      }
      if (Wallet.status.didLoadTransactions && Wallet.status.didLoadBalances) {
        if (Wallet.goal.send != null) {
          $uibModal.open({
            templateUrl: 'partials/send.jade',
            controller: 'SendCtrl',
            resolve: {
              paymentRequest: () => Wallet.goal.send,
              loadBcQrReader: () => $ocLazyLoad.load('bcQrReader')
            },
            windowClass: 'bc-modal initial'
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
      } else {
        $timeout($scope.checkGoals, 100);
      }
    }
  };

  $scope.$on('enableRequestBeacon', () => {
    $scope.requestBeacon = true;
  });

  $scope.back = () => $window.history.back();
}
