angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController ($scope, $q, state, $http, Upload) {
  $scope.states = state.stateCodes;
  let exchange = $scope.vm.exchange;

  $scope.state = {
    signedURL: undefined,
    // verificationStatus: exchange.profile.verificationStatus
    // Mock
    verificationStatus: 'needs_documents'
  };

  $scope.fields = {
    idType: 'id',
    file: undefined
  };

  $scope.setState = () => {
    // state.verificationStatus = exchange.profile.verificationStatus;
    // Mock
    $scope.state.verificationStatus = 'needs_documents';
  };

  $scope.getSignedURL = () => {
    let profile = exchange.profile;
    let idType = $scope.fields.idType;

    $q.resolve(profile.getSignedURL(idType)
      .then((res) => $scope.state.signedURL = res.signed_url)
      .catch((err) => console.log(err)));
  };

  $scope.upload = () => {
    Upload.upload({
      method: 'PUT',
      url: $scope.state.signedURL,
      data: { file: $scope.fields.file }
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
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
        .then(() => $scope.vm.goTo('link'))
        .finally($scope.free);
    } catch (error) {
      console.error(error);
      $scope.free();
    }
  };

  $scope.installLock();
  $scope.$watch('fields.idType', $scope.getSignedURL);
}
