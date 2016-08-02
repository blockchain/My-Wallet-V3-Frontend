angular
  .module('walletApp')
  .controller('UpgradeCtrl', UpgradeCtrl);

function UpgradeCtrl ($scope, Wallet, $uibModalInstance, $log, $window, $translate, $timeout, $rootScope) {
  $scope.waiting = true;
  $scope.busy = false;

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

  $timeout(() => $scope.waiting = false, 3000);
}
