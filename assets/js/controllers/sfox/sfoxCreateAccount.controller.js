angular
  .module('walletApp')
  .controller('SfoxCreateAccountController', SfoxCreateAccountController);

function SfoxCreateAccountController ($scope, Wallet) {
  $scope.views = ['email', 'mobile', 'summary'];
  $scope.exchange = $scope.vm.exchange;

  $scope.handleCreate = () => {
    Wallet.api.incrementPartnerAccountCreation('sfox');
    $scope.vm.userId = $scope.exchange.user;
    $scope.vm.siftScienceEnabled = true;
    $scope.vm.goTo('verify');
  };
}
