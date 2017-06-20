angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, bcPhoneNumber) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.openHelper = modals.openHelper;
  let exchange = $scope.exchange = $scope.vm.exchange;

  $scope.steps = ['address', 'info'];
  $scope.fields = ['fullName', 'mobile', 'pancard', 'address', 'pincode', 'state'];
  $scope.initialStep = exchange.profile.addressComplete ? 'info' : 'address';

  $scope.verifyProfile = () => $scope.vm.goTo('upload');

  $scope.setProfile = (fields) => {
    let profile = $scope.exchange.profile;

    profile.address.street = profile.street;
    profile.address.city = profile.city;
    profile.address.state = profile.state;
    profile.address.zipcode = profile.zipcode;
  };

  AngularHelper.installLock.call($scope);
}
