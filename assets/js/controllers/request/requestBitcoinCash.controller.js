angular
  .module('walletApp')
  .controller('RequestBitcoinCashController', RequestBitcoinCashController);

function RequestBitcoinCashController ($scope, MyWallet, AngularHelper, BitcoinCash, browser, Env) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
  });

  $scope.browser = browser;

  $scope.state = {
    address: ''
  };

  $scope.state.to = MyWallet.wallet.bch.defaultAccount;
  $scope.destinations = BitcoinCash.accounts.filter((a) => !a.archived);
  $scope.isToImportedAddress = () => $scope.state.to.type === 'Imported Addresses';

  $scope.copyAddress = () => {
    $scope.state.isAddressCopied = true;
  };

  $scope.address = () => BitcoinCash.toBitcoinCash($scope.state.to.receiveAddress, true);
  $scope.$watch('state.to', () => $scope.state.address = $scope.address());

  AngularHelper.installLock.call($scope);
}
