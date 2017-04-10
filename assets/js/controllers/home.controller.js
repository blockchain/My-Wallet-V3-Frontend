angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, Wallet, $uibModal, buyStatus) {
  $scope.getTotal = () => Wallet.total('');
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
}
