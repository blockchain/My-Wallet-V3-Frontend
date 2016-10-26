angular
  .module('walletApp')
  .controller('SfoxSignupStepsController', SfoxSignupStepsController);

function SfoxSignupStepsController ($scope, $stateParams) {
  $scope.step = $stateParams.step;
}
