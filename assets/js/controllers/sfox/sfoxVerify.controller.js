angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($scope, $q, state) {
  let exchange = $scope.vm.exchange;

  $scope.states = state.stateCodes;
  $scope.state = { busy: false };

  $scope.verify = () => {
    $scope.lock();
    try {
      let profile = exchange.profile;
      let fields = $scope.state;

      profile.firstName = fields.first;
      profile.middleName = fields.middle;
      profile.lastName = fields.last;
      profile.dateOfBirth = new Date(fields.dob);
      profile.setSSN(fields.ssn);

      profile.setAddress(
        fields.addr1,
        fields.addr2,
        fields.city,
        fields.state.Code,
        fields.zipcode
      );

      $q.resolve(profile.verify())
        .then(() => $scope.vm.goTo('link'))
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  $scope.lock = () => { $scope.state.busy = true; };
  $scope.free = () => { $scope.state.busy = false; };
}
