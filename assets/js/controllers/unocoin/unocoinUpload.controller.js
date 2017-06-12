angular
  .module('walletApp')
  .controller('UnocoinUploadController', UnocoinUploadController);

function UnocoinUploadController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  let exchange = $scope.vm.exchange;
  let getNextIdType = () => idTypes.shift();
  let idTypes = ['pancard', 'photo', 'address'];

  $scope.openHelper = modals.openHelper;
  $scope.goTo = (step) => $scope.state.step = step;

  $scope.state = {
    base: 'unocoin_',
    idType: getNextIdType()
  };

  $scope.setState = () => {
    $scope.state.idType = getNextIdType();
  };

  $scope.prepUpload = (file) => {
    let fields = $scope.state;
    let idType = fields.idType;
    let profile = exchange.profile;

    return $q.resolve(Upload.base64DataUrl(file))
      .then((url) => profile.addPhoto(idType, url))
      .then(() => idTypes.length > 0 ? $scope.setState() : $scope.verify());
  };

  $scope.verify = () => {
    $scope.lock();

    let profile = exchange.profile;
    
    return $q.resolve(profile.verify())
             .then(() => $scope.vm.goTo('pending'))
             .catch(unocoin.displayError)
             .finally($scope.free);
  };

  AngularHelper.installLock.call($scope);

  // QA Tool
  $scope.autoFillPhotos = () => {
    ['id', 'pancard', 'photo', 'address'].forEach((idType) => exchange.profile.addPhoto(idType, QA.base64DataUrl()));
    $scope.verify();
  };
}
