angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($rootScope, $scope, $q, state, $http, sfox, modals, Upload, QA) {
  $scope.states = state.stateCodes;
  let exchange = $scope.vm.exchange;

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

  $scope.getSignedURL = () => {
    $scope.lock();
    let fields = $scope.state;
    let profile = exchange.profile;
    let idType = fields.idType;
    let filename = fields.file.name;

    // QA Tool
    fields.verifyDoc && (filename = 'testing-' + filename);

    $q.resolve(profile.getSignedURL(idType, filename))
      .then((res) => $scope.state.signedURL = res.signed_url)
      .catch((err) => console.log(err))
      .finally($scope.free);
  };

  $scope.upload = () => {
    $scope.lock();
    let { signedURL, file } = $scope.state;

    Upload.http({
      method: 'PUT',
      url: signedURL,
      data: file,
      headers: { 'content-type': 'application/octet-stream' }
    }).then(() => exchange.fetchProfile())
      .then(() => $scope.setState())
      .catch(sfox.displayError);
  };

  $scope.verify = () => {
    $scope.lock();

    try {
      let fields = $scope.state;
      let profile = exchange.profile;

      profile.firstName = profile.firstName || fields.first;
      profile.middleName = profile.middleName || fields.middle;
      profile.lastName = profile.lastName || fields.last;
      profile.dateOfBirth = profile.dateOfBirth || new Date(fields.dob);
      profile.setSSN(profile.identity.number || fields.ssn);

      profile.setAddress(
        profile.address.street.line1 || fields.addr1,
        profile.address.street.line2 || fields.addr2,
        profile.address.city || fields.city,
        profile.address.state || fields.state.Code,
        profile.address.zipcode || fields.zipcode
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

  $scope.installLock();
  $scope.$watch('state.file', (file) => file && $scope.getSignedURL());
  $scope.$watch('state.verificationStatus.level', watchVerificationStatusLevel);
  $scope.$on('$destroy', () => { exchange.profile && exchange.profile.setSSN(null); });

  // QA Tool
  $scope.SFOXDebugDocs = QA.SFOXDebugDocs;
  $scope.SFOXAddressForm = () => angular.merge($scope.state, QA.SFOXAddressForm());
}
