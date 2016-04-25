angular
  .module('walletApp')
  .controller('FirstTimeCtrl', FirstTimeCtrl);

function FirstTimeCtrl ($scope, $uibModalInstance, firstTime) {
  $scope.firstTime = firstTime;
  $scope.ok = () => $uibModalInstance.close(firstTime);
}
