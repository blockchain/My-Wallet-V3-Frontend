angular
  .module('walletApp')
  .controller('WalletCtrl', WalletCtrl);

function WalletCtrl ($scope, $rootScope, Wallet, $uibModal, $timeout, Alerts, $interval, $ocLazyLoad, $state, $uibModalStack, $q, localStorageService, MyWallet, currency, $translate, $window, buyStatus, modals, MyBlockchainApi, Ethereum) {
  let isUsingRequestQuickCopyExperiment = MyBlockchainApi.createExperiment(1);

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
    if (!Wallet.status.isLoggedIn || $rootScope.inMobileBuy) return;
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
    isUsingRequestQuickCopyExperiment.recordA();
    return $uibModal.open({
      templateUrl: 'partials/request/request.pug',
      windowClass: 'bc-modal initial',
      controller: 'RequestController',
      controllerAs: 'vm',
      resolve: {
        destination: () => null
      }
    });
  });

  $scope.send = () => {
    Alerts.clear();
    modals.openSend({ address: '', amount: '' });
  };

  $scope.$on('requireMainPassword', (notification, defer) => {
    const modalInstance = $uibModal.open({
      templateUrl: 'partials/main-password.pug',
      controller: 'MainPasswordCtrl',
      windowClass: 'bc-modal',
      resolve: {
        defer: () => defer
      }
    });
    modalInstance.result.then(() => {}, () => defer.reject());
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
    if (wallet && [
      'wallet.common.buy-sell'
      // 'wallet.common.settings.accounts_addresses'
    ].includes(toState.name)) {
      let error;

      if (!wallet.isMetadataReady) {
        Wallet.askForSecondPasswordIfNeeded().then(pw => {
          Wallet.my.wallet.cacheMetadataKey.bind(Wallet.my.wallet)(pw).then(() => {
            Alerts.displaySuccess('NEEDS_REFRESH');
            $rootScope.needsRefresh = true;
          });
        });
        event.preventDefault();
      } else if ($rootScope.needsRefresh) {
        error = 'NEEDS_REFRESH';
      } else if (wallet.external === null) {
        // Metadata service connection failed
        error = 'POOR_CONNECTION';
      }
      if (error) {
        event.preventDefault();
        Alerts.displayError(error);
      }
    }
  });

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    if (!$scope.isPublicState(toState.name) && !$scope.status.isLoggedIn) {
      let showLogout = $window.name === 'blockchain-logout' && localStorageService.get('session');
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
    let tasks = [
      MyWallet.wallet.getHistory(),
      currency.fetchExchangeRate(Wallet.settings.currency),
      currency.fetchEthRate(Wallet.settings.currency),
      Ethereum.fetchHistory()
    ];
    $q.all(tasks)
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $scope.$broadcast('refresh');
        $timeout(() => $scope.refreshing = false, 500);
      });
  };

  $scope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
    console.log(error.message);
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
      if (Wallet.goal.firstTime && Wallet.status.didUpgradeToHd) {
        buyStatus.canBuy().then((canBuy) => {
          let template = canBuy ? 'partials/buy-login-modal.pug' : 'partials/first-login-modal.pug';
          $uibModal.open({
            templateUrl: template,
            windowClass: 'bc-modal rocket-modal initial',
            controller ($scope, walletStats) {
              $scope.walletCount = walletStats.walletCountMillions;
            }
          });
        });
        Wallet.goal.firstLogin = true;
        Wallet.goal.firstTime = void 0;
      }
      if (!Wallet.goal.firstLogin) {
        if (Ethereum.userHasAccess && !Ethereum.hasSeen) {
          modals.openEthLogin();
          Ethereum.setHasSeen();
          return;
        } else {
          buyStatus.canBuy().then((canBuy) => {
            if (buyStatus.shouldShowBuyReminder() &&
                !buyStatus.userHasAccount() &&
                canBuy) buyStatus.showBuyReminder();
          });
        }
      }
      if (Wallet.status.didLoadTransactions && Wallet.status.didLoadBalances) {
        if (Wallet.goal.send != null) {
          modals.openSend(Wallet.goal.send);
          Wallet.goal.send = void 0;
        }
      } else {
        $timeout($scope.checkGoals, 100);
      }
    }
  };

  $scope.back = () => $window.history.back();
}
