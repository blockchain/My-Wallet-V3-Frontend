angular
  .module('walletApp')
  .controller('UnocoinCreateAccountController', UnocoinCreateAccountController);

function UnocoinCreateAccountController ($scope, unocoin) {
  $scope.views = ['email', 'summary'];
  $scope.exchange = $scope.vm.exchange;

  $scope.clearVerificationError = () => $scope.vm.verificationError = null;

  $scope.createAccount = () => {
    let exchange = $scope.exchange;
    let exit = () => $scope.vm.close(true);
    let step = unocoin.determineStep(exchange);
    let verificationRequired = unocoin.verificationRequired(exchange.profile);

    verificationRequired ? $scope.vm.goTo(step) : exchange.getTrades().then(exit).catch(exit);
  };
}
