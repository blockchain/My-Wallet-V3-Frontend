angular
  .module('walletApp')
  .controller('RequestEthereumController', RequestEthereumController);

function RequestEthereumController ($scope, AngularHelper, Wallet, Alerts, currency, $log, $translate, $stateParams, filterFilter, $filter, $q, format, smartAccount, Labels, $timeout, browser, Env, Ethereum) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
  });

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.isBitCurrency = currency.isBitCurrency;
  $scope.format = currency.formatCurrencyForView;

  $scope.browser = browser;

  $scope.destinationLimit = 50;
  $scope.increaseLimit = () => $scope.destinationLimit += 50;

  $scope.state = {
    to: null,
    label: '',
    address: '',
    amount: null
  };

  $scope.isToImportedAddress = () => $scope.state.to.type === 'Imported Addresses';

  $scope.address = () => Ethereum.defaultAccount.address;

  $scope.$watch('state.to', () => $scope.state.address = $scope.address());

  AngularHelper.installLock.call($scope);
}
