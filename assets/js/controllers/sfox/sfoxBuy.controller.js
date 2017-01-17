angular
  .module('walletApp')
  .controller('SfoxBuyController', SfoxBuyController);

function SfoxBuyController ($scope, Wallet, sfox, formatTrade) {
  let exchange = $scope.vm.exchange;

  $scope.summaryCollapsed = true;
  $scope.user = Wallet.user;
  $scope.buyLimit = exchange.profile.limits.buy;
  $scope.quoteHandler = (...args) => sfox.fetchQuote(exchange, ...args);

  $scope.buyHandler = (...args) => {
    return sfox.buy($scope.account, ...args)
      .then(trade => {
        sfox.watchTrade(trade);
        $scope.trade = formatTrade.initiated(trade, [$scope.account]);
      });
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });
}
