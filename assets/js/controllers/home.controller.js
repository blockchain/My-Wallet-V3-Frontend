angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, Wallet, $uibModal, buyStatus) {
  $scope.getTotal = () => Wallet.total('');
  $scope.getLegacyTotal = () => Wallet.total('imported');

  buyStatus.canBuy().then((canBuy) => {
    if (buyStatus.shouldShowBuyReminder() &&
        !buyStatus.userHasAccount() &&
        canBuy) buyStatus.showBuyReminder();
  });

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
