angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, Options) {
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

  $scope.setState = () => {
    $scope.state.file = undefined;
  };

  $scope.prepUpload = () => {
    $scope.lock();
    let fields = $scope.state;
    let profile = exchange.profile;
    let idType = fields.idType;
    let filename = fields.file.name;

    // QA Tool
    fields.verifyDoc && (filename = 'testing-' + filename);

    $q.resolve(profile.getSignedURL(idType, filename))
      .then((res) => $scope.upload(res.signed_url))
      .catch((err) => console.log(err));
  };

  $scope.upload = (url) => {
    let { file } = $scope.state;

    Upload.http({
      method: 'PUT',
      url: url,
      data: file,
      headers: { 'content-type': 'application/octet-stream' }
    }).then(() => exchange.fetchProfile())
      .then(() => $scope.setState())
      .catch(unocoin.displayError)
      .finally($scope.free);
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
        .then(() => $scope.setState())
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
  $scope.SFOXDebugDocs = QA.SFOXDebugDocs;
  $scope.SFOXAddressForm = () => angular.merge($scope.state, QA.SFOXAddressForm());
}
