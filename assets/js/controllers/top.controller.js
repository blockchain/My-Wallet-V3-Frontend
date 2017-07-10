angular
  .module('walletApp')
  .controller('TopCtrl', TopCtrl);

function TopCtrl ($scope, Wallet, currency, browser, Ethereum, assetContext) {
  $scope.copied = false;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = currency.isBitCurrency;
  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.browser = browser;

  $scope.toggleDisplayCurrency = () => Wallet.toggleTransactionDisplayCurrency();

  $scope.getTotal = () => Wallet.total();
  $scope.getEthTotal = () => Ethereum.balance;

  $scope.context = assetContext.getContext();
  if ($scope.context.balance === 'btc') $scope.hideEthBalance = true;
  else if ($scope.context.balance === 'both') $scope.hideEthBalance = $scope.hideBtcBalance = false;
  else $scope.hideBtcBalance = true;

  $scope.resetCopy = () => $scope.copied = false;

  $scope.nextAddress = () => {
    if ($scope.copied) return;
    $scope.copied = true;
    let defaultIdx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
    return Wallet.getReceivingAddressForAccount(defaultIdx);
  };
}
