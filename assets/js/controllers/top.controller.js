angular
  .module('walletApp')
  .controller('TopCtrl', TopCtrl);

function TopCtrl ($scope, $filter, Wallet, currency, browser, Ethereum, BitcoinCash, assetContext, MyBlockchainApi, Env, languages) {
  Env.then(env => {
    if (env.webHardFork.balanceMessage) {
      $scope.balanceMessage = languages.localizeMessage(env.webHardFork.balanceMessage);
    }
  });

  $scope.copied = false;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = currency.isBitCurrency;

  $scope.browser = browser;
  $scope.activeAsset = assetContext.activeAsset;

  $scope.assets = {
    btc: {
      code: 'btc',
      total: () => Wallet.total('') || 0
    },
    eth: {
      code: 'eth',
      total: () => Ethereum.balance || 0
    },
    bch: {
      code: 'bch',
      total: () => BitcoinCash.balance || 0
    }
  };
}
