angular
  .module('walletApp')
  .controller('UnocoinCreateAccountController', UnocoinCreateAccountController);

function UnocoinCreateAccountController ($scope) {
  $scope.name = 'Unocoin';
  $scope.views = ['summary', 'email'];
  $scope.mobileRequired = false;
  $scope.exchange = $scope.vm.exchange;
  $scope.goTo = (s) => $scope.vm.goTo(s);
}
