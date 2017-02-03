angular
  .module('walletApp')
  .controller('SfoxBuyController', SfoxBuyController);

function SfoxBuyController ($scope, Wallet, Alerts, sfox, formatTrade) {
  let exchange = $scope.vm.exchange;

  $scope.user = Wallet.user;
  $scope.userId = exchange.user;
  $scope.summaryCollapsed = false;
  $scope.quote = $scope.vm.quote;
  $scope.quoteHandler = (...args) => sfox.fetchQuote(exchange, ...args);

  $scope.state = {
    buyLimit: exchange.profile.limits.buy,
    buyLevel: exchange.profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.buyLimit = exchange.profile.limits.buy;
    $scope.state.buyLevel = exchange.profile.verificationStatus.level;
  };

  $scope.buySuccess = (trade) => {
    exchange.fetchProfile().then($scope.setState);
    $scope.trade = formatTrade.initiated(trade, [$scope.account]);
    let pendingTrades = sfox.trades.filter(t => !t.bitcoinReceived);
    Wallet.webkitNotify('buyCompleted', pendingTrades.map(t => t.toJSON()));
  };

  $scope.buyError = () => {
    Alerts.displayError('Error connecting to our exchange partner');
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });
}
