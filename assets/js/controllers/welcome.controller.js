angular
  .module('walletApp')
  .controller('WelcomeCtrl', WelcomeCtrl);

function WelcomeCtrl ($scope, $timeout, $state) {
  $scope.signup = () => {
    $state.go('public.signup', { email: $scope.fields.email });
  }
}
