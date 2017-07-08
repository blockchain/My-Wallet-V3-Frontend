angular
  .module('walletApp')
  .controller('TopCtrl', TopCtrl);

function TopCtrl ($scope, Wallet, currency, browser) {
  $scope.copied = false;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = currency.isBitCurrency;
  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.browser = browser;

  $scope.toggleDisplayCurrency = () => Wallet.toggleTransactionDisplayCurrency();

  $scope.getTotal = () => Wallet.total();
  // TODO add getTotal for ETH
  $scope.getEthTotal = () => 0.555;
  $scope.resetCopy = () => $scope.copied = false;

  $scope.nextAddress = () => {
    if ($scope.copied) return;
    $scope.copied = true;
    let defaultIdx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
    return Wallet.getReceivingAddressForAccount(defaultIdx);
  };
}
