angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  let exchange = $scope.vm.exchange;

  $scope.openHelper = modals.openHelper;

  $scope.state = {
    step: 'address'
  };

  $scope.onStep = (step) => step === $scope.state.step;
  $scope.goTo = (step) => $scope.state.step = step;

  $scope.setAddress = () => {
    let fields = $scope.state;
    let profile = exchange.profile;

    profile.fullName = fields.fullName;
    profile.mobile = fields.mobile;
    profile.pancard = fields.pancard;
    profile.address.street = fields.street;
    profile.address.city = fields.city;
    profile.address.state = fields.state;
    profile.address.zipcode = fields.zipcode;

    $scope.goTo('info');
  };

  $scope.setInfo = () => {
    let fields = $scope.state;
    let profile = exchange.profile;

    profile.bankAccountNumber = fields.bankAccountNumber;
    profile.ifsc = fields.ifsc;

    $scope.vm.goTo('upload');
  };

  AngularHelper.installLock.call($scope);
  $scope.$watch('state.step', (val) => console.log(val));

  // QA Tool
  $scope.unocoinInfoForm = () => angular.merge($scope.state, QA.unocoinInfoForm());
  $scope.unocoinAddressForm = () => angular.merge($scope.state, QA.unocoinAddressForm());
}
