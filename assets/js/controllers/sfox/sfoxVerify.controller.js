angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($scope, state) {
  $scope.states = state.stateCodes;
}
