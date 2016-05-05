angular
  .module('walletApp')
  .controller('UpgradeCtrl', UpgradeCtrl);

function UpgradeCtrl ($scope, Wallet, $uibModalInstance, $log, $window, $translate, $timeout, $rootScope) {
  $scope.waiting = true;
  $scope.busy = false;
  $scope.settings = Wallet.settings;

  $scope.upgrade = () => {
    const secondPasswordCancelled = () => {
      $scope.insist = true;
      $scope.busy = false;
    };

    const success = () => {
      $scope.busy = false;
      $uibModalInstance.close();
    };

    $scope.insist = false;
    $scope.busy = true;
    Wallet.upgrade(success, secondPasswordCancelled);
  };

  $scope.goToBlockchain = () => {
    $window.location = $rootScope.rootURL + 'wallet-legacy/login';
  };

  $scope.cancel = () => {
    $scope.busy = false;
    $scope.goToBlockchain();
  };

  $timeout(() => {
    $scope.waiting = false;
  }, 3000);
}
