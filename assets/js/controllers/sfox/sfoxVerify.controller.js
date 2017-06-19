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

    profile.setSSN(profile.ssn);

    profile.setAddress(
      profile.addr1,
      profile.addr2,
      profile.city,
      profile.state.Code,
      profile.zipcode
    );
  };
}
