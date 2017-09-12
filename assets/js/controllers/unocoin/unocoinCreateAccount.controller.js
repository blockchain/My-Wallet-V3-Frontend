angular
  .module('walletApp')
  .controller('UnocoinCreateAccountController', UnocoinCreateAccountController);

function UnocoinCreateAccountController ($scope, unocoin) {
  $scope.views = ['email', 'summary'];
  $scope.exchange = $scope.vm.exchange;

  $scope.clearVerificationError = () => $scope.vm.verificationError = null;

  $scope.createAccount = () => {
    let exchange = $scope.exchange;
    let step = unocoin.determineStep(exchange);
    let verificationRequired = unocoin.verificationRequired(exchange.profile);

    verificationRequired ? $scope.vm.goTo(step) : $scope.vm.close(true);
  };
}
