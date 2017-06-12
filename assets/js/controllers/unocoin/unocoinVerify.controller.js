angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, bcPhoneNumber) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.exchange = $scope.vm.exchange;
  $scope.openHelper = modals.openHelper;

  $scope.steps = ['address', 'info'];
  $scope.fields = ['fullName', 'mobile', 'pancard', 'address', 'pincode', 'state'];

  $scope.verifyProfile = () => $scope.vm.goTo('upload');

  $scope.setProfile = (fields) => {
    let profile = $scope.exchange.profile;

    profile.fullName = fields.fullName;
    profile.mobile = fields.mobile;
    profile.pancard = fields.pancard;
    profile.address.street = fields.street;
    profile.address.city = fields.city;
    profile.address.state = fields.state;
    profile.address.zipcode = fields.zipcode;
    profile.bankAccountNumber = fields.bankAccountNumber;
    profile.ifsc = fields.ifsc;
  };

  AngularHelper.installLock.call($scope);
  $scope.$watch('state.step', (val) => console.log(val));
}
