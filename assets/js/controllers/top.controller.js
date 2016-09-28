angular
  .module('walletApp')
  .controller('TopCtrl', TopCtrl);

function TopCtrl ($scope, $stateParams, Wallet, currency) {
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = currency.isBitCurrency;
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;
  $scope.status = Wallet.status;
  $scope.accountIndex = $stateParams.accountIndex;
  $scope.copied = false;

  $scope.getTotal = (index) => Wallet.total(index);
  $scope.resetCopy = () => $scope.copied = false;

  $scope.hasLegacyAddresses = () => {
    if (Wallet.status.isLoggedIn) {
      return Wallet.legacyAddresses().filter(a => !a.archived && !a.isWatchOnly).length > 0;
    } else {
      return null;
    }
  };

  $scope.nextAddress = () => {
    if ($scope.copied) return;
    $scope.copied = true;
    let selectedIdx = parseInt($scope.accountIndex, 10);
    let defaultIdx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
    let idx = isNaN(selectedIdx) ? defaultIdx : selectedIdx;
    return Wallet.getReceivingAddressForAccount(idx);
  };
}
