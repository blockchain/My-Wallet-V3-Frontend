angular
  .module('walletApp')
  .controller('SfoxSignupController', SfoxSignupController);

function SfoxSignupController ($scope, $stateParams) {
  $scope.step = $stateParams.step;
}
