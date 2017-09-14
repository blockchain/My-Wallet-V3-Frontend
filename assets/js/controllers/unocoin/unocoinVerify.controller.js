angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinVerifyController (MyWallet, AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, bcPhoneNumber) {
  Env.then(env => {
    $scope.qaDebugger = env.qaDebugger;
  });

  $scope.openHelper = modals.openHelper;
  $scope.verificationError = $scope.vm.verificationError;

  let external = MyWallet.wallet.external;
  let exchange = $scope.exchange = $scope.vm.exchange;

  $scope.steps = enumify('address', 'info');
  $scope.fields = ['fullName', 'mobile', 'pancard', 'address', 'pincode', 'state'];
  $scope.initialStep = exchange.profile.identityComplete ? 'info' : 'address';

  $scope.verifyProfile = () => $scope.vm.goTo('upload');

  $scope.handleRestart = () => {
    $scope.vm.goTo('create');
    external.wipe();
  };

  $scope.setProfile = () => {
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
