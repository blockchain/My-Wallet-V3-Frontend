angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, Wallet, $uibModal, buyStatus, localStorageService, Ethereum, currency) {
  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.getTotal = () => Wallet.total('');
  $scope.getEthTotal = () => Ethereum.balance;
  $scope.getLegacyTotal = () => Wallet.total('imported');

  $scope.isWalletInitialized = () => {
    let { isLoggedIn, didLoadSettings, didLoadTransactions } = Wallet.status;
    return isLoggedIn && didLoadSettings && (didLoadTransactions || !Wallet.isUpgradedToHD);
  };

  $scope.activeLegacyAddresses = () => (
    Wallet.status.isLoggedIn
      ? Wallet.legacyAddresses().filter(a => !a.archived)
      : null
  );

  $scope.activeAccounts = () => (
    Wallet.status.isLoggedIn
      ? Wallet.accounts().filter(a => !a.archived)
      : null
  );

  $scope.showMobileConversion = () => {
    const showMobileConversion = localStorageService.get('showMobileConversion');
    if (showMobileConversion === false) {
      return false;
    } else {
      return true;
    }
  };
}
