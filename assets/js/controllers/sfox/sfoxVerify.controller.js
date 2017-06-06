angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController (AngularHelper, Env, $scope, $q, state, $http, sfox, modals, Upload, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
    let states = env.partners.sfox.states;
    $scope.states = state.stateCodes.filter((s) => states.indexOf(s.Code) > -1);
  });

  let exchange = $scope.vm.exchange;

  $scope.openHelper = modals.openHelper;

  $scope.state = {
    idType: 'ssn'
  };

  $scope.isBeforeNow = (date) => {
    let then = new Date(date).getTime();
    return then < Date.now();
  };

  $scope.verify = () => {
    $scope.lock();

    try {
      let fields = $scope.state;
      let profile = exchange.profile;

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
        .then(() => $scope.vm.goTo('upload'))
        .catch(sfox.displayError)
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  AngularHelper.installLock.call($scope);
  $scope.$on('$destroy', () => { exchange.profile && exchange.profile.setSSN(null); });

  // QA Tool
  $scope.SFOXAddressForm = () => angular.merge($scope.state, QA.SFOXAddressForm());
}
