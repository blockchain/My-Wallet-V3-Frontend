angular
  .module('walletApp')
  .controller("FirstTimeCtrl", FirstTimeCtrl);

function FirstTimeCtrl($scope, $modalInstance, firstTime) {
  $scope.firstTime = firstTime;
  $scope.ok = () => {
  	$modalInstance.close(firstTime);
  }
}
