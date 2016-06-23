angular
  .module('walletApp')
  .controller('WalletCtrl', WalletCtrl);

function WalletCtrl ($scope, $rootScope, Wallet, $uibModal, $timeout, Alerts, $interval, $ocLazyLoad) {
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

  $scope.$on('needsUpgradeToHD', notification => {
    $uibModal.open({
      templateUrl: 'partials/upgrade.jade',
      controller: 'UpgradeCtrl',
      backdrop: 'static',
      windowClass: 'bc-modal',
      keyboard: false
    });
  });
}
