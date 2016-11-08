angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($scope, $q, state, $http, Upload) {
  $scope.states = state.stateCodes;
  let exchange = $scope.vm.exchange;

  $scope.state = {
    signedURL: undefined,
    verificationStatus: 'unverified'
  };

  $scope.fields = {
    idType: 'id',
    file: undefined
  };

  $scope.getSignedURL = () => {
    $scope.lock();
    let profile = exchange.profile;
    let idType = $scope.fields.idType;

    $q.resolve(profile.getSignedURL(idType))
      .then((res) => $scope.state.signedURL = res.signed_url)
      .catch((err) => console.log(err))
      .finally($scope.free);
  };

  $scope.upload = () => {
    $scope.lock();

    Upload.http({
      method: 'PUT',
      url: $scope.state.signedURL,
      data: $scope.fields.file,
      headers: {
        'content-type': 'application/octet-stream'
      }}).then(() => $scope.vm.goTo('link'))
         .catch((err) => console.log(err))
         .finally($scope.free);
  };

  $scope.verify = () => {
    $scope.lock();
    try {
      let profile = exchange.profile;
      let fields = $scope.state;

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
        // .then(() => $scope.vm.goTo('link'))
        .then(() => $scope.state.verificationStatus = 'needs_documents')
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  $scope.installLock();
  $scope.$watch('vm.exchange.profile', (p) => p && $scope.getSignedURL());
}
