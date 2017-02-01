angular
  .module('walletApp')
  .controller('SfoxBuyController', SfoxBuyController);

function SfoxBuyController ($scope, Wallet, Alerts, sfox, formatTrade) {
  let exchange = $scope.vm.exchange;

  $scope.summaryCollapsed = true;
  $scope.user = Wallet.user;
  $scope.quoteHandler = (...args) => sfox.fetchQuote(exchange, ...args);

  $scope.state = {
    buyLimit: exchange.profile.limits.buy,
    buyLevel: exchange.profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.buyLimit = exchange.profile.limits.buy;
    $scope.state.buyLevel = exchange.profile.verificationStatus.level;
  };

  $scope.buyHandler = (...args) => {
    return sfox.buy($scope.account, ...args)
      .then(trade => {
        sfox.watchTrade(trade);
        $scope.trade = formatTrade.initiated(trade, [$scope.account]);
      })
      .then(() => exchange.fetchProfile())
      .then(() => $scope.setState())
      .catch(() => {
        Alerts.displayError('Error connecting to our exchange partner');
      });
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });
}
