angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $state) {
  $scope.signup = () => {
    $state.go('public.signup', { email: $scope.fields.email });
  };
}
