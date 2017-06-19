angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController (Env, $q, $scope, state, sfox, modals, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.exchange = $scope.vm.exchange;
  $scope.goTo = (s) => $scope.vm.goTo(s);

  $scope.steps = ['address'];
  $scope.fields = ['first', 'middle', 'last', 'ssn', 'dob', 'addr1', 'addr2', 'state-US', 'zipcode'];

  $scope.openHelper = modals.openHelper;

  $scope.verifyProfile = () => {
    $q.resolve($scope.exchange.profile.verify())
      .then(() => $scope.goTo('upload'))
      .catch(sfox.displayError)
      .finally($scope.free);
  };

  $scope.setProfile = (fields) => {
    let profile = $scope.exchange.profile;

    profile.firstName = fields.firstName;
    profile.middleName = fields.middle;
    profile.lastName = fields.lastName;
    profile.dateOfBirth = new Date(fields.dob);
    profile.setSSN(fields.ssn);

    profile.setAddress(
      fields.addr1,
      fields.addr2,
      fields.city,
      fields.state.Code,
      fields.zipcode
    );
  };
}
