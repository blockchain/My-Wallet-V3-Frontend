angular
  .module('walletApp')
  .controller('RequestEthereumController', RequestEthereumController);

function RequestEthereumController ($scope, AngularHelper, browser, Env, Ethereum, localStorageService, Alerts) {
  let links;
  let copiedEthereumAddress = false;

  Env.then(env => {
    links = env.ethereum.surveyLinks;
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
    $scope.ethereumAccount = Ethereum.defaultAccount;
    $scope.ethereumAccount.fetchBalance().then(etherBalance => $scope.etherBalance = etherBalance.balance);
  });

  $scope.browser = browser;

  $scope.state = {
    address: ''
  };

  $scope.address = () => Ethereum.defaultAccount.address;

  $scope.copyEthereumAddress = () => {
    $scope.state.isAddressCopied = true;
    copiedEthereumAddress = true;
  };

  $scope.promptEthereumSurvey = () => {
    if (!localStorageService.get('ethereum-survey') && !copiedEthereumAddress && $scope.etherBalance === '0') {
      Alerts.surveyCloseConfirm('ethereum-survey', links, 1);
    }
  };

  $scope.$watch('state.to', () => $scope.state.address = $scope.address());
  $scope.$on('$destroy', () => $scope.promptEthereumSurvey());

  AngularHelper.installLock.call($scope);
}
