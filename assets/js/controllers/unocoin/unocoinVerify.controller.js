angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, Options) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  let exchange = $scope.vm.exchange;
  let idTypes = ['address', 'id', 'pancard', 'photo'];
  let getNextIdType = () => idTypes.shift();

  $scope.openHelper = modals.openHelper;

  $scope.state = {
    idType: getNextIdType(),
    step: 'address'
  };

  $scope.onStep = (step) => step === $scope.state.step;
  $scope.goTo = (step) => $scope.state.step = step;

  $scope.setState = () => {
    $scope.state.file = undefined;
    $scope.state.idType = getNextIdType();
  };

  $scope.prepUpload = () => {
    $scope.lock();
    let fields = $scope.state;
    let profile = exchange.profile;
    let idType = fields.idType;

    $q.resolve(Upload.base64DataUrl(fields.file))
      .then((url) => profile.addPhoto(idType, url.split(',')[1]))
      .then(() => idTypes.length > 0 ? $scope.setState() : $scope.verify())
      .then($scope.free);
  };

  $scope.setAddress = () => {
    let fields = $scope.state;
    let profile = exchange.profile;

    profile.fullName = fields.fullName;
    profile.address.street = fields.street;
    profile.address.city = fields.city;
    profile.address.state = fields.state;
    profile.address.zipcode = fields.zipcode;

    $scope.goTo('info');
  };

  $scope.setInfo = () => {
    let fields = $scope.state;
    let profile = exchange.profile;

    profile.mobile = fields.mobile;
    profile.pancard = fields.pancard;
    profile.bankAccountNumber = fields.bankAccountNumber;
    profile.ifsc = fields.ifsc;

    $scope.goTo('photos');
  };

  $scope.verify = () => {
    $scope.lock();

    try {
      let profile = exchange.profile;

      $q.resolve(profile.verify())
        .then(() => $scope.vm.goTo('buy'))
        .catch(unocoin.displayError)
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  AngularHelper.installLock.call($scope);
  $scope.$on('$destroy', () => { exchange.profile && exchange.profile.setSSN(null); });
  $scope.$watch('state.step', (val) => console.log(val));

  // QA Tool
  $scope.unocoinInfoForm = () => angular.merge($scope.state, QA.unocoinInfoForm());
  $scope.unocoinAddressForm = () => angular.merge($scope.state, QA.unocoinAddressForm());
}
