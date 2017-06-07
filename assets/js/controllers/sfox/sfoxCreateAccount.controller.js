angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope) {
  $scope.name = 'SFOX';
  $scope.views = ['summary', 'email', 'mobile'];
  $scope.mobileRequired = true;
  $scope.exchange = $scope.vm.exchange;
  $scope.goTo = (s) => $scope.vm.goTo(s);
}
