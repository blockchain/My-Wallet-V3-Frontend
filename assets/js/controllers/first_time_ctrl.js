walletApp.controller("FirstTimeCtrl", ($scope, $modalInstance, firstTime) => {
  $scope.firstTime = firstTime;
  $scope.ok = () => {
  	$modalInstance.close(firstTime);
  }
});