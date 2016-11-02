angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, modals) {
  let exchange = $scope.vm.external.sfox;
  if (!exchange.profile) return;
  $scope.signupCompleted = exchange.profile.verificationStatus === 'complete';
  $scope.openSfoxSignup = () => modals.openSfoxSignup(exchange);
}
