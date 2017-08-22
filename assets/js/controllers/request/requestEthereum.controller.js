angular
  .module('walletApp')
  .controller('RequestEthereumController', RequestEthereumController);

function RequestEthereumController ($scope, AngularHelper, browser, Env, Ethereum) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
  });

  $scope.browser = browser;

  $scope.state = {
    address: ''
  };

  $scope.address = () => Ethereum.defaultAccount.address;

  $scope.$watch('state.to', () => $scope.state.address = $scope.address());

  AngularHelper.installLock.call($scope);
}
