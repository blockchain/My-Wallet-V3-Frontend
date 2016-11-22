angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($rootScope, $scope, $q, state, $http, Upload, QA) {
  $scope.states = state.stateCodes;
  let exchange = $scope.vm.exchange;

  let getNextIdType = () => {
    if (!exchange.profile) return 'ssn';
    let { level, required_docs = [] } = exchange.profile.verificationStatus;

    let verificationInProgress = level === 'pending' && required_docs.length === 0;
    let needsSSN = !exchange.profile.identity.number && !verificationInProgress;

    return needsSSN ? 'ssn' : required_docs[0];
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

  $scope.getSignedURL = () => {
    $scope.lock();
    let fields = $scope.state;
    let profile = exchange.profile;
    let idType = fields.idType;
    let filename = fields.file.name;

    $q.resolve(profile.getSignedURL(idType, filename))
      .then((res) => $scope.state.signedURL = res.signed_url)
      .catch((err) => console.log(err))
      .finally($scope.free);
  };

  $scope.upload = () => {
    $scope.lock();
    let fields = $scope.state;

    Upload.http({
      method: 'PUT',
      url: $scope.state.signedURL,
      data: fields.file,
      headers: {
        'content-type': 'application/octet-stream'
      }}).then(() => $scope.verify())
         .catch((err) => console.log(err))
         .finally($scope.free);
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
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  $scope.installLock();
  $scope.$watch('state.file', (file) => file && $scope.getSignedURL());
  $scope.$watch('state.verificationStatus.level', (newVal) => newVal === 'verified' && $scope.vm.goTo('link'));

  // QA Tools
  $scope.SFOXAddressForm = () => angular.merge($scope.state, QA.SFOXAddressForm());
}
