angular
  .module('walletApp')
  .controller('UnocoinPendingController', UnocoinPendingController);

function UnocoinPendingController ($scope) {
  $scope.close = () => {
    $scope.vm.close();
  };
}
