angular
  .module('walletApp')
  .controller('WalletCtrl', WalletCtrl);

function WalletCtrl ($scope, $rootScope, Wallet, $uibModal, $timeout, Alerts, $interval, $ocLazyLoad, $state, $uibModalStack, $q, $cookies, MyWallet, currency, $translate, $window, buyStatus, modals) {
  $scope.goal = Wallet.goal;

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $rootScope.isMock = Wallet.isMock;
  $rootScope.needsRefresh = false;

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
  $scope.getTheme = () => $scope.settings.theme && $scope.settings.theme.class;

  $scope.inactivityCheck = () => {
    if (!Wallet.status.isLoggedIn) return;
    let inactivityTimeSeconds = Math.round((Date.now() - $scope.lastAction) / 1000);
    let logoutTimeSeconds = Wallet.settings.logoutTimeMinutes * 60;
    if (inactivityTimeSeconds === logoutTimeSeconds - 10) {
      let logoutTimer = $timeout(() => Wallet.logout({ auto: true }), 10000);
      let alertOpts = { values: { minutes: Wallet.settings.logoutTimeMinutes }, action: 'LOG_ME_OUT' };
      Alerts.confirm('CONFIRM_AUTO_LOGOUT', alertOpts)
        .then(Wallet.logout).catch(() => $timeout.cancel(logoutTimer));
    }
  };

  $scope.inactivityInterval = $interval($scope.inactivityCheck, 1000);
  $scope.$on('$destroy', () => $interval.cancel($scope.inactivityInterval));

  $rootScope.browserWithCamera = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) !== void 0;

  $scope.request = modals.openOnce(() => {
    Alerts.clear();
    return $uibModal.open({
      templateUrl: 'partials/request.pug',
      windowClass: 'bc-modal auto',
      controller: 'RequestCtrl',
      resolve: {
        destination: () => null,
        focus: () => false
      }
    });
  });

  $scope.send = modals.openOnce(() => {
    Alerts.clear();
    return $uibModal.open({
      templateUrl: 'partials/send.pug',
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
  });

  $scope.$on('requireSecondPassword', (notification, defer, insist) => {
    const modalInstance = $uibModal.open({
      templateUrl: 'partials/second-password.pug',
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

  $scope.isPublicState = (stateName) => (
    stateName.split('.')[0] === 'public' ||
    ['landing', 'open', 'wallet.common.unsubscribe'].indexOf(stateName) > -1
  );

  $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    let wallet = MyWallet.wallet;
    if ($scope.isPublicState(toState.name) && Wallet.status.isLoggedIn) {
      event.preventDefault();
    }
    if (wallet && toState.name === 'wallet.common.buy-sell') {
      let error;

      if (wallet.external && !wallet.external.loaded) error = 'POOR_CONNECTION';
      else if (wallet.isDoubleEncrypted) error = 'MUST_DISABLE_2ND_PW';
      else if ($rootScope.needsRefresh) error = 'NEEDS_REFRESH';

      if (error) {
        event.preventDefault();
        Alerts.displayError(error);
      }
    }
  });

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    if (!$scope.isPublicState(toState.name) && !$scope.status.isLoggedIn) {
      let showLogout = $window.name === 'blockchain-logout' && $cookies.get('session');
      $state.go(`public.${showLogout ? 'logout' : 'login-no-uid'}`);
    }
    $rootScope.outOfApp = toState.name === 'landing';
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
          templateUrl: 'partials/upgrade.pug',
          controller: 'UpgradeCtrl',
          backdrop: 'static',
          windowClass: 'bc-modal',
          keyboard: false
        });
        Wallet.goal.upgrade = void 0;
      }
      if (Wallet.goal.auth) {
        Alerts.clear();
        Wallet.goal.auth = void 0;
      }
      if (Wallet.goal.firstTime) {
        buyStatus.canBuy().then((canBuy) => {
          let template = canBuy ? 'partials/buy-login-modal.pug' : 'partials/first-login-modal.pug';
          $uibModal.open({
            templateUrl: template,
            windowClass: 'bc-modal rocket-modal initial'
          });
        });
        Wallet.goal.firstLogin = true;
        Wallet.goal.firstTime = void 0;
      }
      if (!Wallet.goal.firstLogin) {
        buyStatus.canBuy().then((canBuy) => {
          if (buyStatus.shouldShowBuyReminder() &&
              !buyStatus.userHasAccount() &&
              canBuy) buyStatus.showBuyReminder();
        });
      }
      if (Wallet.status.didLoadTransactions && Wallet.status.didLoadBalances) {
        if (Wallet.goal.send != null) {
          $uibModal.open({
            templateUrl: 'partials/send.pug',
            controller: 'SendCtrl',
            resolve: {
              paymentRequest: () => Wallet.goal.send,
              loadBcQrReader: () => $ocLazyLoad.load('bcQrReader')
            },
            windowClass: 'bc-modal initial'
          });
          Wallet.goal.send = void 0;
        }
      } else {
        $timeout($scope.checkGoals, 100);
      }
    }
  };

  $scope.back = () => $window.history.back();
}
