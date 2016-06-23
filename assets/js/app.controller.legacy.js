// TODO: move to different places

function AppCtrl ($scope, Wallet, Alerts, $state, $rootScope, $cookies, $location, $timeout, $interval, $uibModal, $window, $translate, $uibModalStack, $http, $q) {

  $scope.goal = Wallet.goal;


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

  $scope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
    let message = typeof error === 'string' ? error : 'ROUTE_ERROR';
    Alerts.displayError(message);
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
      if (!((Wallet.status.didLoadTransactions) && (Wallet.status.didLoadBalances))) {
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
              paymentRequest: () => Wallet.goal.send,
              loadBcQrReader: () => {
                return $ocLazyLoad.load('bcQrReader');
              }
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

  $scope.back = () => $window.history.back();
}
