angular
  .module('walletApp')
  .controller('RequestBitcoinCashController', RequestBitcoinCashController);

function RequestBitcoinCashController ($scope, MyWallet, AngularHelper, browser, Env) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
  });

  $scope.browser = browser;

  $scope.state = {
    address: ''
  };

  $scope.destinations = MyWallet.wallet.bch.accounts;
  $scope.state.to = MyWallet.wallet.bch.defaultAccount;
  $scope.isToImportedAddress = () => $scope.state.to.type === 'Imported Addresses';

  $scope.copyAddress = () => {
    $scope.state.isAddressCopied = true;
  };

  $scope.address = () => $scope.state.to.receiveAddress;
  $scope.$watch('state.to', () => $scope.state.address = $scope.address());

  AngularHelper.installLock.call($scope);
}
