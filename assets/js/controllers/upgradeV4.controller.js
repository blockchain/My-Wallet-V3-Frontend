angular
  .module('walletApp')
  .controller('UpgradeCtrlV4', UpgradeCtrlV4);

function UpgradeCtrlV4 ($scope, Wallet, $uibModalInstance, $log, $window, $translate, $timeout, $rootScope) {
  $scope.waiting = true;
  $scope.busy = false;

  $scope.upgradeV4 = () => {
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
    Wallet.upgradeV4(success, secondPasswordCancelled);
  };

  $timeout(() => $scope.waiting = false, 3000);
}
