angular
  .module('walletApp')
  .controller('UnocoinCreateAccountController', UnocoinCreateAccountController);

function UnocoinCreateAccountController ($scope) {
  $scope.views = ['email', 'summary'];
  $scope.exchange = $scope.vm.exchange;
}
