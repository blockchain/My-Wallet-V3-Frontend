angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController (AngularHelper, Env, $scope, $q, state, $http, sfox, modals, Upload, QA, Options) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  let exchange = $scope.vm.exchange;
  let states = Options.options.partners.sfox.states;
  $scope.states = state.stateCodes.filter((s) => states.indexOf(s.Code) > -1);

  $scope.openHelper = modals.openHelper;

  let getNextIdType = () => {
    if (!exchange.profile) return 'ssn';
    let { required_docs = [] } = exchange.profile.verificationStatus;

    return required_docs[0] ? required_docs[0] : 'ssn';
  };

  $scope.state = {
    idType: getNextIdType(),
    signedURL: undefined
  };

  $scope.setState = () => {
    $scope.state.verificationStatus = exchange.profile.verificationStatus;
    $scope.state.idType = getNextIdType();
    $scope.state.file = undefined;
  };

  $scope.isBeforeNow = (date) => {
    let then = new Date(date).getTime();
    return then < Date.now();
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
      .catch(sfox.displayError)
      .finally($scope.free);
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
        .then(() => $scope.setState())
        .catch(sfox.displayError)
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  let watchVerificationStatusLevel = (level) => {
    let { required_docs = [] } = exchange.profile.verificationStatus;
    let complete;

    if (level === 'verified') complete = true;
    if (level === 'pending' && !required_docs[0]) complete = true;

    complete && $scope.vm.goTo('link');
  };

  AngularHelper.installLock.call($scope);
  $scope.$watch('state.verificationStatus.level', watchVerificationStatusLevel);
  $scope.$on('$destroy', () => { exchange.profile && exchange.profile.setSSN(null); });

  // QA Tool
  $scope.SFOXDebugDocs = QA.SFOXDebugDocs;
  $scope.SFOXAddressForm = () => angular.merge($scope.state, QA.SFOXAddressForm());
}
