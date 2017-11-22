angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, MyWallet, Wallet, Ethereum, BitcoinCash, tradeStatus, localStorageService, currency) {
  $scope.btc = {
    total: () => Wallet.total('') + Wallet.total('imported'),
    accounts: MyWallet.wallet.hdwallet.accounts
  };

  $scope.eth = {
    total: () => Ethereum.balance
  };

  $scope.bch = {
    total: () => BitcoinCash.balance,
    accounts: MyWallet.wallet.bch.accounts
  };

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
