angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function SfoxVerifyController (Env, $q, $scope, state, sfox, modals, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.exchange = $scope.vm.exchange;
  $scope.goTo = (s) => $scope.vm.goTo(s);

  $scope.initialStep = 'address';
  $scope.steps = enumify('address');
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

    profile.dateOfBirth = new Date(profile.dob);
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
