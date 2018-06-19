angular
  .module('walletApp')
  .controller('WalletCtrl', WalletCtrl);

function WalletCtrl ($scope, $rootScope, Wallet, $uibModal, $timeout, Alerts, $interval, $ocLazyLoad, $state, $uibModalStack, $q, localStorageService, MyWallet, currency, $translate, $window, tradeStatus, modals, MyBlockchainApi, Ethereum, BitcoinCash, ShapeShift, coinify, unocoin, sfox, Env) {
  Env.then(env => {
    $scope.buySellDisabled = env.buySell.disabled;
    $scope.buySellDisabledReason = env.buySell.disabledReason;
  });

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

  $scope.request = () => {
    Alerts.clear();
    isUsingRequestQuickCopyExperiment.recordA();
    modals.openRequest();
  };

  $scope.send = () => {
    Alerts.clear();
    modals.openSend({ address: '', amount: '' });
  };

  $scope.$on('requireMainPassword', (notification, defer) => {
    const modalInstance = $uibModal.open({
      templateUrl: 'partials/main-password.pug',
      controller: 'MainPasswordCtrl',
      windowClass: 'bc-modal',
      keyboard: false,
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
      windowClass: 'bc-modal second-password',
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
    let featureDisabledWhen = (disabled, reason) => {
      if (disabled) {
        Alerts.featureDisabled(reason);
        event.preventDefault();
        return true;
      }
    };

    if (Wallet.status.isLoggedIn && $scope.isPublicState(toState.name)) {
      event.preventDefault();
    } else {
      switch (toState.name) {
        case 'wallet.common.buy-sell': return (
          featureDisabledWhen($scope.buySellDisabled, $scope.buySellDisabledReason)
        );
        case 'wallet.common.buy-sell.coinify': return (
          featureDisabledWhen(coinify.disabled, coinify.disabledReason)
        );
        case 'wallet.common.buy-sell.unocoin': return (
          featureDisabledWhen(unocoin.disabled, unocoin.disabledReason)
        );
        case 'wallet.common.buy-sell.sfox': return (
          featureDisabledWhen(sfox.disabled, sfox.disabledReason)
        );
        case 'wallet.common.shift': return (
          featureDisabledWhen(ShapeShift.disabled, ShapeShift.disabledReason)
        );
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
      MyWallet.wallet.bch.getHistory(),
      currency.fetchAllRates(Wallet.settings.currency),
      Ethereum.fetchHistory()
    ];
    $q.all(tasks)
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $rootScope.$broadcast('refresh');
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
        tradeStatus.canTrade().then((canTrade) => {
          let template = canTrade && !$scope.buySellDisabled ? 'partials/buy-login-modal.pug' : 'partials/first-login-modal.pug';
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
        Ethereum.setHasSeen();
      }
      if (Wallet.status.didLoadTransactions && Wallet.status.didLoadBalances) {
        let { send, needsTransitionFromLegacy } = Wallet.goal;
        if (needsTransitionFromLegacy && !Ethereum.isWaitingOnTransaction()) {
          modals.openEthLegacyTransition();
        } else if (send != null) {
          modals.openSend(send);
          Wallet.goal.send = void 0;
        } else if (!Wallet.goal.firstLogin && Wallet.status.didUpgradeToHd) {
          if (!Ethereum.hasSeen && !$rootScope.inMobileBuy) {
            modals.openAnnouncement('eth', 'wallet.common.eth.transactions');
            Ethereum.setHasSeen();
          } else if (!BitcoinCash.hasSeen && !$rootScope.inMobileBuy) {
            modals.openAnnouncement('bch', 'wallet.common.bch.transactions');
            BitcoinCash.setHasSeen();
          } else {
            tradeStatus.canTrade().then((canTrade) => {
              Env.then((env) => {
                if (canTrade) {
                  if (!sfox.hasSeenBuy && sfox.showBuyAnnouncement(canTrade, tradeStatus.isSFOXCountryState, env.partners.sfox.showBuyFraction) && !$rootScope.inMobileBuy) {
                    modals.openAnnouncement('SFOX.buy', 'wallet.common.buy-sell');
                    sfox.setHasSeenBuy();
                  } else if (!sfox.hasSeen && sfox.showAnnouncement(canTrade, tradeStatus.isSFOXCountryState) && !$rootScope.inMobileBuy) {
                    modals.openAnnouncement('SFOX', 'wallet.common.buy-sell');
                    sfox.setHasSeen();
                  } else if (tradeStatus.shouldShowBuyReminder() && !tradeStatus.userHasAccount()) {
                    tradeStatus.showBuyReminder();
                  }
                }
              });
            });
          }
        }
      } else {
        $timeout($scope.checkGoals, 100);
      }
    }
  };

  $scope.back = () => $window.history.back();
}
