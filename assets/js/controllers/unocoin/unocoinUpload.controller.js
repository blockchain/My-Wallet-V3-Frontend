angular
  .module('walletApp')
  .controller('UnocoinUploadController', UnocoinUploadController);

function UnocoinUploadController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA) {
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
}
