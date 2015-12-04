angular
  .module('walletApp')
  .controller("AppCtrl", AppCtrl);

function AppCtrl($scope, Wallet, Alerts, $state, $rootScope, $location, $cookieStore, $timeout, $uibModal, $window, $translate) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $rootScope.isMock = Wallet.isMock;
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

  $rootScope.browserWithCamera = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) !== void 0;

  $scope.request = () => {
    Alerts.clear();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/request.jade",
      controller: "RequestCtrl",
      resolve: {
        destination: () => null,
        focus: () => false
      },
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => Wallet.store.resetLogoutTimeout());
    }
  };

  $scope.send = () => {
    Alerts.clear();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/send.jade",
      controller: "SendCtrl",
      resolve: {
        paymentRequest: () => ({
          address: "",
          amount: ""
        })
      },
      windowClass: "bc-modal"
    });

    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    let loggedOutStates = ['public', 'public.login', 'public.recover', 'public.reminder', 'public.signup', 'public.help', 'open'];
    if (loggedOutStates.every(s => toState.name !== s) && $scope.status.isLoggedIn === false) {
      $state.go("public.login");
    }
    if (Wallet.status.isLoggedIn && (Wallet.store.resetLogoutTimeout != null)) {
      Wallet.store.resetLogoutTimeout();
    }
  });

  $scope.$watch("status.isLoggedIn", () => {
    $timeout(() => {
      $scope.checkGoals();
    }, 0);
  });

  $scope.$watchCollection("goal", ()=>  {
    $timeout(() => {
      $scope.checkGoals();
    }, 0);
  });

  $scope.checkGoals = () => {
    if ($scope.status.isLoggedIn) {
      if (!((Wallet.settings.currency != null) && (Wallet.settings.btcCurrency != null))) {
        return $timeout((() => {
          $scope.checkGoals();
        }), 100);
      }
      if (Wallet.goal != null) {
        if (Wallet.goal.send != null) {
          $uibModal.open({
            templateUrl: "partials/send.jade",
            controller: "SendCtrl",
            resolve: {
              paymentRequest: () => Wallet.goal.send
            },
            windowClass: "bc-modal"
          });
          Wallet.goal.send = void 0;
        }
        if (Wallet.goal.claim != null) {
          let modalInstance = $uibModal.open({
            templateUrl: "partials/claim.jade",
            controller: "ClaimModalCtrl",
            resolve: {
              claim: () => Wallet.goal.claim
            },
            windowClass: "bc-modal"
          });
          modalInstance.result.then(() => {
            Wallet.goal.claim = void 0;
          });
        }
        if (Wallet.goal.auth) {
          Alerts.clear();
          $translate(['AUTHORIZED', 'AUTHORIZED_MESSAGE']).then( translations => {
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

  $scope.$on("requireSecondPassword", (notification, defer, insist) => {
    const modalInstance = $uibModal.open({
      templateUrl: "partials/second-password.jade",
      controller: "SecondPasswordCtrl",
      backdrop: insist ? "static" : null,
      windowClass: "bc-modal",
      resolve: {
        insist: () => insist,
        defer: () => defer
      }
    });
    modalInstance.result.then(() => {}, () => { defer.reject();});
  });

  $scope.$on("needsUpgradeToHD", notification => {
    const modalInstance = $uibModal.open({
      templateUrl: "partials/upgrade.jade",
      controller: "UpgradeCtrl",
      backdrop: "static",
      windowClass: "bc-modal"
    });
  });

  $scope.back = () => {$window.history.back()};
}
