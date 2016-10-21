
export default function LandingController ($scope, $state) {
  $scope.fields = {};
  $scope.signup = () => {
    $state.go('public.signup', { email: $scope.fields.email });
  };
}
