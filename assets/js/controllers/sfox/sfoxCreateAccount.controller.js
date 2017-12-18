angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope) {
  $scope.views = ['email', 'mobile', 'summary'];
  $scope.exchange = $scope.vm.exchange;

  $scope.handleCreate = () => {
    $scope.vm.userId = $scope.exchange.user;
    $scope.vm.siftScienceEnabled = true;
    $scope.vm.goTo('verify');
  };
}
