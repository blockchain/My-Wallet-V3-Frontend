angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope) {
  $scope.views = ['email', 'mobile', 'summary'];
  $scope.exchange = $scope.vm.exchange;
}
