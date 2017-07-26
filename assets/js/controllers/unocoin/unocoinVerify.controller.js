angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, bcPhoneNumber) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.openHelper = modals.openHelper;
  let exchange = $scope.exchange = $scope.vm.exchange;

  $scope.error = $scope.vm.error;
  $scope.steps = enumify('address', 'info');
  $scope.fields = ['fullName', 'mobile', 'pancard', 'address', 'pincode', 'state'];
  $scope.initialStep = exchange.profile.identityComplete ? 'info' : 'address';

  $scope.verifyProfile = () => $scope.vm.goTo('upload');

  $scope.setProfile = (fields) => {
    let profile = $scope.exchange.profile;

    profile.address.street = profile.street;
    profile.address.city = profile.city;
    profile.address.state = profile.state;
    profile.address.zipcode = profile.zipcode;
  };

  $scope.setBankInfo = () => {
    let profile = $scope.exchange.profile;
    profile.submittedBankInfo = true;
    $scope.verifyProfile();
  };

  AngularHelper.installLock.call($scope);
  $scope.$onDestroy = () => $scope.vm.error = null;
}
